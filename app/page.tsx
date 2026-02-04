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
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/OrvexOperators"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b6bbff]/70 hover:text-white transition-colors"
            aria-label="Follow us on X"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
          >
            Launch App
          </Link>
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
