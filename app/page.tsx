'use client';

import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
      {/* Animated Background with particles */}
      <AnimatedBackground />

      {/* Mouse-following glow */}
      <CursorGlow color="rgba(98, 101, 254, 0.08)" size={500} blur={100} />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6265fe] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Image src="/logo.svg" alt="Orvex" width={38} height={38} className="relative rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">
              Orvex
            </span>
          </Link>
          <a
            href="https://docs.orvex.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-[#b6bbff]/60 hover:text-white transition-colors duration-300 font-medium"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* X Icon */}
          <a
            href="https://x.com/OrvexFi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20 flex items-center justify-center text-[#b6bbff]/60 hover:text-white hover:border-[#6265fe]/50 hover:bg-[#6265fe]/10 transition-all duration-300"
            aria-label="Follow us on X"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Discord */}
          <div className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20">
            <svg className="w-4 h-4 text-[#b6bbff]/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="text-[10px] font-bold text-[#b9f0d7] tracking-wider uppercase">Soon</span>
          </div>
          {/* Launch Orvex */}
          <a
            href="https://orvex.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 h-9 rounded-xl bg-[#0d0d1a]/80 border border-[#b9f0d7]/30 text-[#b9f0d7] text-sm font-medium hover:bg-[#b9f0d7]/10 hover:border-[#b9f0d7]/50 transition-all duration-300"
          >
            Launch Orvex
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Logo with orbital elements */}
        <div className="relative mb-10 opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          {/* Outer glow */}
          <div className="absolute inset-[-40px] bg-gradient-to-r from-[#6265fe]/14 to-[#b9f0d7]/14 rounded-full blur-3xl animate-pulse-glow" />

          {/* Orbiting elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-[#6265fe] rounded-full animate-orbit opacity-50 shadow-[0_0_8px_rgba(98,101,254,0.5)]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#b9f0d7] rounded-full animate-orbit-reverse opacity-40 shadow-[0_0_8px_rgba(185,240,215,0.5)]" />
          </div>

          {/* Pulse rings */}
          <div className="absolute inset-[-20px] rounded-full border border-[#6265fe]/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-[-35px] rounded-full border border-[#6265fe]/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />

          {/* Logo */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6265fe]/14 to-[#b9f0d7]/14 animate-glow-pulse rounded-full" />
            <Image src="/logo.svg" alt="Orvex" fill className="object-contain p-3" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            <span className="gradient-text">Complete Tasks.</span>
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mt-2">
            <span className="gradient-text-accent animate-text-glow">Earn Rewards.</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-[#b6bbff]/60 text-center max-w-xl mb-10 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          Join the Orvex community. Connect your wallet, verify your X account,
          and start earning points by completing social tasks.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(98,101,254,0.5)] hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#7d85d0] to-[#6265fe] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link
            href="/dashboard"
            className="text-[#b6bbff]/60 hover:text-white transition-colors duration-300 text-sm underline underline-offset-4 decoration-[#7d85d0]/30 hover:decoration-[#6265fe]"
          >
            Already registered? Login
          </Link>
        </div>

        {/* Stats/Features Grid */}
        <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
          {/* Card 1 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(98,101,254,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#6265fe]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Connect Wallet</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Link your wallet to get started with Orvex
            </p>
          </div>

          {/* Card 2 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7d85d0]/20 to-[#7d85d0]/5 border border-[#7d85d0]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(125,133,208,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#7d85d0]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Verify X Account</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Post a verification tweet and submit proof
            </p>
          </div>

          {/* Card 3 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/20 to-[#b9f0d7]/5 border border-[#b9f0d7]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(185,240,215,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#b9f0d7]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Earn Points</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Complete tasks and climb the leaderboard
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure & Verified</span>
          </div>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant Rewards</span>
          </div>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Growing Community</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-[#7d85d0]/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#7d85d0]/60">
            <span className="gradient-text font-medium">Orvex Operators</span>
            <span>2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://docs.orvex.fi" target="_blank" rel="noopener noreferrer" className="text-xs text-[#7d85d0]/50 hover:text-white transition-colors">
              Documentation
            </a>
            <a href="https://x.com/OrvexFi" target="_blank" rel="noopener noreferrer" className="text-xs text-[#7d85d0]/50 hover:text-white transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
