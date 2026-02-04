'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b9f0d7] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7d85d0] rounded-full opacity-5 blur-[150px]" />
      </div>

      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-[#7d85d0]/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Orvex" width={40} height={40} className="rounded-full" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
              Orvex
            </span>
          </div>
          <a
            href="https://docs.orvex.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b6bbff]/70 hover:text-white transition-colors font-medium"
          >
            Docs
          </a>
        </div>
        <div className="flex items-center gap-3">
          {/* X Icon */}
          <a
            href="https://x.com/OrvexFi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-[#1a1a2e] border border-[#7d85d0]/20 flex items-center justify-center text-[#b6bbff]/70 hover:text-white hover:border-[#7d85d0]/40 transition-all"
            aria-label="Follow us on X"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Discord with SOON badge */}
          <div className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-[#1a1a2e] border border-[#7d85d0]/20">
            <svg className="w-5 h-5 text-[#b6bbff]/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="text-xs font-bold text-[#b9f0d7] tracking-wide">SOON</span>
          </div>
          {/* Launch Orvex button */}
          <a
            href="https://orvex.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 h-10 rounded-lg bg-[#1a1a2e] border border-[#b9f0d7]/30 text-[#b9f0d7] font-medium hover:bg-[#b9f0d7]/10 hover:border-[#b9f0d7]/50 transition-all"
          >
            Launch Orvex
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </nav>

      <main className="relative flex flex-col items-center justify-center px-8 py-24 md:py-32">
        {/* Hero section */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#6265fe] to-[#b9f0d7] rounded-full opacity-20 blur-2xl animate-pulse" />
          <Image src="/logo.svg" alt="Orvex" width={96} height={96} className="relative rounded-full animate-float" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-[#c9e8ff] to-[#b6bbff] bg-clip-text text-transparent">
            Complete Tasks.
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#b9f0d7] via-[#c9e8ff] to-[#6265fe] bg-clip-text text-transparent">
            Earn Rewards.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#b6bbff]/70 text-center max-w-2xl mb-12">
          Join the Orvex community. Connect your wallet, verify your X account,
          and start earning points by completing social tasks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] transition-all duration-300 hover:-translate-y-1"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="text-[#b6bbff]/70 hover:text-white transition-colors underline underline-offset-4"
          >
            Already registered? Login
          </Link>
        </div>

        {/* Stats section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#6265fe]/40 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#6265fe] to-[#b9f0d7] bg-clip-text text-transparent mb-2">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
            <p className="text-[#b6bbff]/60">Link your wallet to get started with Orvex</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7d85d0]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#7d85d0]/40 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#7d85d0] to-[#c9e8ff] bg-clip-text text-transparent mb-2">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verify X Account</h3>
            <p className="text-[#b6bbff]/60">Post a verification tweet and submit proof</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#b9f0d7]/40 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] bg-clip-text text-transparent mb-2">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Earn Points</h3>
            <p className="text-[#b6bbff]/60">Complete tasks and climb the leaderboard</p>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-[#7d85d0]/20 px-8 py-6 text-center text-[#7d85d0]/60">
        <span className="bg-gradient-to-r from-[#7d85d0] to-[#b6bbff] bg-clip-text text-transparent">
          Orvex Operators
        </span>{' '}
        2026
      </footer>
    </div>
  );
}
