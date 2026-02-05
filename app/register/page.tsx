'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';

type Step = 'welcome' | 'wallet' | 'tweet' | 'follow' | 'complete';

function RegisterContent() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('wallet');
  const [tweetUrl, setTweetUrl] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [followScreenshot, setFollowScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Extract X handle from @handle or URL format
  const parseXHandle = (input: string): string => {
    if (!input) return '';
    const trimmed = input.trim();

    // If it's a URL (x.com or twitter.com)
    const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(@)?([a-zA-Z0-9_]+)/i);
    if (urlMatch) {
      return urlMatch[2];
    }

    // If it starts with @, remove it
    if (trimmed.startsWith('@')) {
      return trimmed.slice(1);
    }

    // Otherwise return as-is (just the handle)
    return trimmed;
  };

  // Capture referral code from URL on mount and show welcome screen if referred
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setStep('welcome');
    }
  }, [searchParams]);

  const verificationCode = address ? address.slice(-8).toUpperCase() : '';
  const tweetText = `Verifying my wallet for @OrvexFi

Code: ${verificationCode}

#Orvex #Web3`;

  const handleTweetSubmit = async () => {
    const parsedHandle = parseXHandle(xHandle);
    if (!parsedHandle) {
      setError('Please enter your X handle');
      return;
    }
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
          referral_code: referralCode,
          x_handle: parsedHandle,
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

  const displaySteps = ['wallet', 'tweet', 'follow', 'complete'];
  const currentIndex = displaySteps.indexOf(step);

  return (
    <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Mouse-following glow */}
      <CursorGlow color="rgba(98, 101, 254, 0.1)" size={400} blur={80} />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#6265fe] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <Image src="/logo.svg" alt="Orvex" width={36} height={36} className="relative rounded-full" />
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text">
            Orvex
          </span>
        </Link>
        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="text-sm text-[#b6bbff]/50 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-[#6265fe]/10"
          >
            Disconnect
          </button>
        )}
      </nav>

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12 md:py-16">
        {/* Progress indicator - hidden on welcome step */}
        {step !== 'welcome' && (
        <div className="mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between">
            {displaySteps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    currentIndex > i
                      ? 'stepper-complete text-white'
                      : currentIndex === i
                      ? 'stepper-active text-white'
                      : 'bg-[#0d0d1a] border border-[#7d85d0]/20 text-[#7d85d0]/40'
                  }`}
                >
                  {currentIndex > i ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 sm:w-20 h-1 rounded-full transition-all duration-500 ${
                      currentIndex > i
                        ? 'stepper-line-active'
                        : 'bg-[#7d85d0]/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className={`text-xs w-12 text-center transition-colors ${currentIndex >= 0 ? 'text-[#b6bbff]/70' : 'text-[#b6bbff]/30'}`}>Wallet</span>
            <span className={`text-xs w-12 text-center transition-colors ${currentIndex >= 1 ? 'text-[#b6bbff]/70' : 'text-[#b6bbff]/30'}`}>Tweet</span>
            <span className={`text-xs w-12 text-center transition-colors ${currentIndex >= 2 ? 'text-[#b6bbff]/70' : 'text-[#b6bbff]/30'}`}>Follow</span>
            <span className={`text-xs w-12 text-center transition-colors ${currentIndex >= 3 ? 'text-[#b6bbff]/70' : 'text-[#b6bbff]/30'}`}>Done</span>
          </div>
        </div>
        )}

        {/* Step Content */}
        <div className="glass-card p-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          {step === 'welcome' && referralCode && (
            <div className="space-y-8 text-center py-4">
              {/* Welcome Icon */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#ffc107]/30 to-[#6265fe]/30 rounded-full blur-2xl animate-pulse-glow" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#ffc107] to-[#ffab00] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,193,7,0.4)]">
                  <svg className="w-12 h-12 text-[#070713]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>

              {/* Welcome Message */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
                  You&apos;ve Been Invited!
                </h1>
                <p className="text-[#b6bbff]/70 text-sm max-w-sm mx-auto mb-4">
                  A friend has invited you to join the <span className="text-white font-semibold">Orvex Console Operators</span> incentivized testnet campaign.
                </p>
              </div>

              {/* Referral Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/30">
                <svg className="w-5 h-5 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-[#ffc107]">Referred by</span>
                <span className="text-[#ffc107] font-mono font-bold">{referralCode}</span>
              </div>

              {/* Benefits */}
              <div className="p-5 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20 text-left">
                <h3 className="text-sm font-semibold text-white mb-3">What you&apos;ll get:</h3>
                <ul className="space-y-3 text-sm text-[#b6bbff]/70">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#b9f0d7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Earn <span className="text-[#b9f0d7] font-semibold">Console Points (CP)</span> by completing tasks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#b9f0d7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Climb <span className="text-[#6265fe] font-semibold">Operator ranks</span> for point multipliers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#b9f0d7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Position yourself for <span className="text-[#ffc107] font-semibold">future rewards</span></span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setStep('wallet')}
                className="group w-full py-4 bg-gradient-to-r from-[#ffc107] to-[#ffab00] text-[#070713] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,193,7,0.4)] transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Start Registration
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {step === 'wallet' && (
            <div className="space-y-8">
              {referralCode && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20 text-[#ffc107] text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Referred by <span className="font-mono font-semibold">{referralCode}</span>
                </div>
              )}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#6265fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
                  Connect Your Wallet
                </h1>
                <p className="text-[#b6bbff]/50 text-sm">
                  Connect to begin verification.
                </p>
              </div>

              <div className="flex justify-center py-4">
                <ConnectButton />
              </div>

              {isConnected && (
                <button
                  onClick={() => setStep('tweet')}
                  className="group w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Continue
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {step === 'tweet' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1DA1F2]/20 to-[#1DA1F2]/5 border border-[#1DA1F2]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
                  Post Verification Tweet
                </h1>
                <p className="text-[#b6bbff]/50 text-sm mb-4">
                  Verify you own this X account by posting a specific tweet with your verification code.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/20 text-[#b6bbff] text-sm">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-[#6265fe] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white mb-1">How it works:</p>
                    <p className="text-xs text-[#b6bbff]/70">Click &quot;Post on X&quot; to post the verification tweet. It will contain a unique code derived from your wallet address. Once posted, paste the tweet URL below for AI verification.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#b6bbff]/50">
                  Your X handle
                </label>
                <input
                  type="text"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@yourhandle or https://x.com/yourhandle"
                  className="input w-full"
                />
                {xHandle && parseXHandle(xHandle) && (
                  <div className="flex items-center gap-2 text-sm text-[#b9f0d7]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    @{parseXHandle(xHandle)}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20">
                <p className="text-sm whitespace-pre-wrap text-[#c9e8ff]/80 font-mono">{tweetText}</p>
              </div>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#1DA1F2] font-semibold rounded-xl hover:bg-[#1a8cd8] hover:shadow-[0_0_30px_rgba(29,161,242,0.3)] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Post on X
              </a>

              <div className="space-y-2">
                <label className="block text-sm text-[#b6bbff]/50">
                  Paste your tweet URL below
                </label>
                <input
                  type="url"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="https://x.com/yourusername/status/..."
                  className="input w-full"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleTweetSubmit}
                disabled={isSubmitting}
                className="group w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Tweet
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'follow' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/20 to-[#b9f0d7]/5 border border-[#b9f0d7]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#b9f0d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
                  Follow @OrvexFi
                </h1>
                <p className="text-[#b6bbff]/50 text-sm mb-4">
                  Complete your registration by following @OrvexFi on X and verifying it with a screenshot.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#b9f0d7]/10 border border-[#b9f0d7]/20 text-[#b6bbff] text-sm">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-[#b9f0d7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white mb-1">How it works:</p>
                    <p className="text-xs text-[#b6bbff]/70">Click &quot;Follow @OrvexFi&quot; to open X. Then take a screenshot showing that you followed the account (the &quot;Following&quot; button should be visible). Upload that screenshot below for AI verification.</p>
                  </div>
                </div>
              </div>

              <a
                href="https://twitter.com/intent/follow?screen_name=OrvexFi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#1DA1F2] font-semibold rounded-xl hover:bg-[#1a8cd8] hover:shadow-[0_0_30px_rgba(29,161,242,0.3)] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow @OrvexFi
              </a>

              <div className="space-y-2">
                <label className="block text-sm text-[#b6bbff]/50">
                  Upload screenshot showing you follow @OrvexFi
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFollowScreenshot(e.target.files?.[0] || null)}
                    className="w-full px-4 py-4 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.15)] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6265fe]/20 file:text-[#b6bbff] file:text-sm file:font-medium file:cursor-pointer hover:file:bg-[#6265fe]/30"
                  />
                </div>
                {followScreenshot && (
                  <div className="flex items-center gap-2 text-sm text-[#b9f0d7]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {followScreenshot.name}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleFollowSubmit}
                disabled={isSubmitting}
                className="group w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-8 text-center py-4">
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#b9f0d7]/30 to-[#6265fe]/30 rounded-full blur-2xl animate-pulse-glow" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(185,240,215,0.4)]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text-accent mb-3">
                  Verification Complete
                </h1>
                <p className="text-[#b6bbff]/50 text-sm max-w-sm mx-auto">
                  Identity confirmed. You&apos;re cleared to coordinate when the Vortex opens.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Enter Console
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070713] text-white flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
