'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

type Step = 'wallet' | 'tweet' | 'follow' | 'complete';

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [step, setStep] = useState<Step>('wallet');
  const [tweetUrl, setTweetUrl] = useState('');
  const [followScreenshot, setFollowScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const verificationCode = address ? address.slice(-8).toUpperCase() : '';
  const tweetText = `Verifying my wallet for @OrvexOperators

Code: ${verificationCode}

#Orvex #Web3`;

  const handleTweetSubmit = async () => {
    if (!tweetUrl) {
      setError('Please enter your tweet URL');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/verify-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          tweet_url: tweetUrl,
          verification_code: verificationCode,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setStep('follow');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch {
      setError('Failed to verify tweet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowSubmit = async () => {
    if (!followScreenshot) {
      setError('Please upload a screenshot of your follow');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('wallet_address', address || '');
      formData.append('screenshot', followScreenshot);

      const response = await fetch('/api/verify-follow', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        setStep('complete');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch {
      setError('Failed to verify follow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="text-2xl font-bold">ORVEX</Link>
        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="text-zinc-400 hover:text-white transition"
          >
            Disconnect
          </button>
        )}
      </nav>

      <main className="max-w-xl mx-auto px-8 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {['wallet', 'tweet', 'follow', 'complete'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === s
                      ? 'bg-white text-black'
                      : ['wallet', 'tweet', 'follow', 'complete'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {['wallet', 'tweet', 'follow', 'complete'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 3 && <div className="w-8 h-0.5 bg-zinc-800" />}
              </div>
            ))}
          </div>
        </div>

        {step === 'wallet' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-zinc-400">
              Connect your wallet to start the verification process.
            </p>
            <div className="flex justify-center py-8">
              <ConnectButton />
            </div>
            {isConnected && (
              <button
                onClick={() => setStep('tweet')}
                className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === 'tweet' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Post Verification Tweet</h1>
            <p className="text-zinc-400">
              Post this tweet to verify you own this X account.
            </p>

            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-sm whitespace-pre-wrap">{tweetText}</p>
            </div>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-500 text-white font-semibold rounded-lg text-center hover:bg-blue-600 transition"
            >
              Post on X
            </a>

            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">
                Paste your tweet URL below
              </label>
              <input
                type="url"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                placeholder="https://x.com/yourusername/status/..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-600"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleTweetSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Tweet'}
            </button>
          </div>
        )}

        {step === 'follow' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Follow @OrvexOperators</h1>
            <p className="text-zinc-400">
              Follow our X account and upload a screenshot as proof.
            </p>

            <a
              href="https://twitter.com/intent/follow?screen_name=OrvexOperators"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-500 text-white font-semibold rounded-lg text-center hover:bg-blue-600 transition"
            >
              Follow @OrvexOperators
            </a>

            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">
                Upload screenshot showing you follow @OrvexOperators
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFollowScreenshot(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-600"
              />
              {followScreenshot && (
                <p className="text-sm text-zinc-500">{followScreenshot.name}</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleFollowSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="text-6xl">✓</div>
            <h1 className="text-3xl font-bold">Registration Complete!</h1>
            <p className="text-zinc-400">
              Your account has been verified. You can now participate in tasks when the campaign goes live.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
