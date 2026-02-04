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

  const steps = ['wallet', 'tweet', 'follow', 'complete'];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#b9f0d7] rounded-full opacity-10 blur-[100px]" />
      </div>

      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-[#7d85d0]/20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6265fe] to-[#b9f0d7] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
            Orvex
          </span>
        </Link>
        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="text-[#b6bbff]/60 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        )}
      </nav>

      <main className="relative max-w-xl mx-auto px-8 py-16">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentIndex > i
                      ? 'bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] text-white'
                      : currentIndex === i
                      ? 'bg-gradient-to-br from-[#6265fe] to-[#7d85d0] text-white shadow-[0_0_20px_rgba(98,101,254,0.4)]'
                      : 'bg-[#070713] border border-[#7d85d0]/30 text-[#7d85d0]/50'
                  }`}
                >
                  {currentIndex > i ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 transition-all duration-300 ${
                      currentIndex > i
                        ? 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe]'
                        : 'bg-[#7d85d0]/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#b6bbff]/50 w-10 text-center">Wallet</span>
            <span className="text-xs text-[#b6bbff]/50 w-10 text-center">Tweet</span>
            <span className="text-xs text-[#b6bbff]/50 w-10 text-center">Follow</span>
            <span className="text-xs text-[#b6bbff]/50 w-10 text-center">Done</span>
          </div>
        </div>

        {step === 'wallet' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-3">
                Connect Your Wallet
              </h1>
              <p className="text-[#b6bbff]/60">
                Connect your wallet to start the verification process.
              </p>
            </div>

            <div className="flex justify-center py-8">
              <ConnectButton />
            </div>

            {isConnected && (
              <button
                onClick={() => setStep('tweet')}
                className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === 'tweet' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-3">
                Post Verification Tweet
              </h1>
              <p className="text-[#b6bbff]/60">
                Post this tweet to verify you own this X account.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20">
              <p className="text-sm whitespace-pre-wrap text-[#c9e8ff]">{tweetText}</p>
            </div>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#1DA1F2] font-semibold rounded-xl hover:bg-[#1a8cd8] transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </a>

            <div className="space-y-2">
              <label className="block text-sm text-[#b6bbff]/60">
                Paste your tweet URL below
              </label>
              <input
                type="url"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                placeholder="https://x.com/yourusername/status/..."
                className="w-full px-4 py-3.5 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleTweetSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Tweet'}
            </button>
          </div>
        )}

        {step === 'follow' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-3">
                Follow @OrvexOperators
              </h1>
              <p className="text-[#b6bbff]/60">
                Follow our X account and upload a screenshot as proof.
              </p>
            </div>

            <a
              href="https://twitter.com/intent/follow?screen_name=OrvexOperators"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#1DA1F2] font-semibold rounded-xl hover:bg-[#1a8cd8] transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow @OrvexOperators
            </a>

            <div className="space-y-2">
              <label className="block text-sm text-[#b6bbff]/60">
                Upload screenshot showing you follow @OrvexOperators
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFollowScreenshot(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3.5 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6265fe]/20 file:text-[#b6bbff] file:font-medium file:cursor-pointer hover:file:bg-[#6265fe]/30"
                />
              </div>
              {followScreenshot && (
                <p className="text-sm text-[#b9f0d7]">{followScreenshot.name}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleFollowSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] rounded-full opacity-30 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] bg-clip-text text-transparent">
              Registration Complete!
            </h1>
            <p className="text-[#b6bbff]/60">
              Your account has been verified. You can now participate in tasks when the campaign goes live.
            </p>

            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
