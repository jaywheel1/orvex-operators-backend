import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Set ENABLE_AI_VERIFICATION=true in .env.local to enable real AI verification
const AI_VERIFICATION_ENABLED = process.env.ENABLE_AI_VERIFICATION === 'true';

async function verifyFollowWithAI(imageBase64: string, mediaType: string): Promise<{ verified: boolean; reason: string }> {
  // Skip AI verification if disabled (for testing)
  if (!AI_VERIFICATION_ENABLED) {
    console.log('AI verification disabled - auto-approving for testing');
    return { verified: true, reason: 'AI verification disabled - auto-approved for testing' };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this screenshot and determine if it shows that the user is following the Twitter/X account @OrvexFi (or a similar Orvex-related account).

Look for:
1. The "Following" button state (not "Follow")
2. The account name containing "Orvex" or "OrvexFi"
3. Any indication this is a Twitter/X profile page

Respond with JSON only:
{"verified": true/false, "reason": "brief explanation"}`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (textContent && textContent.type === 'text') {
      const parsed = JSON.parse(textContent.text);
      return { verified: parsed.verified, reason: parsed.reason };
    }
    return { verified: false, reason: 'Could not parse AI response' };
  } catch (error) {
    console.error('AI verification error:', error);
    return { verified: false, reason: 'AI verification failed' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const wallet_address = formData.get('wallet_address') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!wallet_address || !screenshot) {
      return NextResponse.json(
        { ok: false, error: 'Missing wallet address or screenshot' },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, tweet_verified, follow_verified')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found. Complete tweet verification first.' },
        { status: 400 }
      );
    }

    if (!user.tweet_verified) {
      return NextResponse.json(
        { ok: false, error: 'Tweet verification required first' },
        { status: 400 }
      );
    }

    // Allow re-verification - no blocking if already verified

    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `follows/${wallet_address.toLowerCase()}_${Date.now()}.${screenshot.type.split('/')[1] || 'png'}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('verification-screenshots')
      .upload(fileName, buffer, {
        contentType: screenshot.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Screenshot upload error:', uploadError);
    }

    const imageBase64 = buffer.toString('base64');
    const mediaType = screenshot.type || 'image/png';

    const aiResult = await verifyFollowWithAI(imageBase64, mediaType);
    const aiVerified = aiResult.verified;

    console.log('AI verification result:', aiResult);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        follow_verified: aiVerified,
        follow_verified_at: aiVerified ? new Date().toISOString() : null,
        follow_screenshot_url: fileName,
        registration_complete: aiVerified,
        registration_completed_at: aiVerified ? new Date().toISOString() : null,
      })
      .eq('wallet_address', wallet_address.toLowerCase());

    if (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update user', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      verified: aiVerified,
      message: aiVerified
        ? 'Follow verified successfully. Registration complete!'
        : 'Follow verification failed - screenshot does not show follow',
    });
  } catch (err) {
    console.error('Verify follow error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
