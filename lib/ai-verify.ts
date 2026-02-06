import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  return new Anthropic({ apiKey });
}

/** Parse AI response JSON, handling markdown code blocks */
export function parseAiJson(text: string): { verified: boolean; reason: string } | null {
  let jsonText = text.trim();
  // Strip markdown code blocks (```json ... ``` or ``` ... ```)
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }
  try {
    const parsed = JSON.parse(jsonText);
    return { verified: !!parsed.verified, reason: parsed.reason || '' };
  } catch {
    // Fallback: look for "verified": true/false pattern in raw text
    const verifiedMatch = text.match(/"verified"\s*:\s*(true|false)/i);
    const reasonMatch = text.match(/"reason"\s*:\s*"([^"]+)"/);
    if (verifiedMatch) {
      return {
        verified: verifiedMatch[1].toLowerCase() === 'true',
        reason: reasonMatch ? reasonMatch[1] : 'Parsed from AI response',
      };
    }
    return null;
  }
}

export async function isAiReviewEnabled(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'ai_review_enabled')
    .single();
  return data?.value === 'true';
}

export async function isRegistrationAiEnabled(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'ai_registration_enabled')
    .single();
  return data?.value === 'true';
}

export async function verifyScreenshotTask(
  imageBase64: string,
  mediaType: string,
  taskName: string,
  taskDescription: string,
  metadata: Record<string, string>
): Promise<{ verified: boolean; reason: string }> {
  try {
    const anthropic = getAnthropicClient();

    let prompt = `Analyze this screenshot and determine if it shows proof that the user completed this task:\n\nTask: ${taskName}\nDescription: ${taskDescription}\n`;

    if (metadata.target_account) {
      prompt += `\nLook for evidence that the user is following the account: ${metadata.target_account}\nCheck for the "Following" button state (not "Follow").\n`;
    }

    prompt += `\nBe reasonably lenient - if the screenshot plausibly shows task completion, mark as verified.\nRespond with JSON only: {"verified": true/false, "reason": "brief explanation"}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
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
          { type: 'text', text: prompt },
        ],
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (textContent?.type === 'text') {
      const result = parseAiJson(textContent.text);
      if (result) return result;
    }
    return { verified: false, reason: 'Could not parse AI response' };
  } catch (error) {
    console.error('AI screenshot verification error:', error);
    return { verified: false, reason: 'AI verification failed - will require manual review' };
  }
}

export async function verifyLinkTask(
  linkUrl: string,
  taskName: string,
  taskDescription: string,
  metadata: Record<string, string>
): Promise<{ verified: boolean; reason: string }> {
  try {
    const anthropic = getAnthropicClient();

    let prompt = `Analyze this submitted URL and determine if it appears to be valid proof for this task:\n\nTask: ${taskName}\nDescription: ${taskDescription}\nSubmitted URL: ${linkUrl}\n`;

    if (metadata.tweet_url) {
      prompt += `\nThe user should have retweeted or quoted this tweet: ${metadata.tweet_url}\nCheck if the submitted URL is a valid tweet URL from twitter.com or x.com.\n`;
    }

    prompt += `\nConsider:\n- Is the URL format valid for the expected platform (twitter.com/x.com)?\n- Does it look like a real tweet/post URL?\n- Be reasonably lenient.\n\nRespond with JSON only: {"verified": true/false, "reason": "brief explanation"}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (textContent?.type === 'text') {
      const result = parseAiJson(textContent.text);
      if (result) return result;
    }
    return { verified: false, reason: 'Could not parse AI response' };
  } catch (error) {
    console.error('AI link verification error:', error);
    return { verified: false, reason: 'AI verification failed - will require manual review' };
  }
}
