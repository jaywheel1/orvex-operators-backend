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

      {/* Mouse-following subtle trail */}
      <CursorGlow color="rgba(98, 101, 254, 0.04)" size={300} blur={60} />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Deep background vortex - behind left text */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] -translate-x-1/3 -translate-y-1/4 pointer-events-none z-0 opacity-30">
        <svg
          className="w-full h-full animate-[spin_120s_linear_infinite]"
          viewBox="0 0 500 500"
        >
          <defs>
            <linearGradient id="bgSpiral1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6265fe" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#7d85d0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#b6bbff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bgSpiral2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7d85d0" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#6265fe" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#b9f0d7" stopOpacity="0" />
            </linearGradient>
            <filter id="bgBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Large outer spiral */}
          <path
            d="M250,250 Q290,210 350,200 Q440,190 480,260 Q500,350 440,420 Q360,480 260,460 Q160,430 120,350 Q90,260 140,180 Q200,100 310,100 Q430,110 480,220"
            fill="none"
            stroke="url(#bgSpiral1)"
            strokeWidth="20"
            strokeLinecap="round"
            filter="url(#bgBlur)"
          />

          {/* Secondary spiral */}
          <path
            d="M250,250 Q210,290 200,350 Q190,440 260,480 Q350,500 420,440 Q480,360 460,260 Q430,160 350,120 Q260,90 180,140 Q100,200 100,310 Q110,430 220,480"
            fill="none"
            stroke="url(#bgSpiral2)"
            strokeWidth="15"
            strokeLinecap="round"
            filter="url(#bgBlur)"
          />

          {/* Inner spiral hint */}
          <path
            d="M250,250 Q280,220 320,215 Q390,210 420,270 Q440,340 390,390 Q320,430 250,410 Q180,380 160,310 Q150,240 200,190 Q260,150 340,170"
            fill="none"
            stroke="url(#bgSpiral1)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#bgBlur)"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
        <div className="flex items-center">
          <Link href="/" className="group">
            <Image src="/orvex-logo.png" alt="Orvex" width={120} height={30} className="opacity-90 group-hover:opacity-100 transition-opacity duration-300" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
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
      <main className="relative z-10 px-6 md:px-12 lg:px-24 pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Hero content - two column layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-8">
          {/* Left column - Text content */}
          <div className="flex flex-col items-start max-w-2xl">
            {/* Headline */}
            <h1 className="mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                <span className="gradient-text">Enter the Vortex</span>
              </span>
              <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] mt-4">
                <span className="gradient-text-accent animate-text-glow">Incentivised Testnet</span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-[#b6bbff]/60 max-w-xl mb-10 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              Battle-test the platform to activate up to 10x multipliers on mainnet.
              Earn Command Points to level up. Your testnet activity is your weapon.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-2xl text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(98,101,254,0.5)] hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Register Now
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
                Already registered? Enter Console
              </Link>
            </div>
          </div>

          {/* Right column - Spiral Vortex Animation */}
          <div className="relative opacity-0 animate-scale-in flex items-center justify-center flex-1" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] lg:w-[520px] lg:h-[520px]">
              {/* Outer glow */}
              <div className="absolute inset-[-20%] rounded-full bg-[#6265fe]/5 blur-3xl" />

              {/* Spiral arms container - rotating */}
              <svg
                className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]"
                viewBox="0 0 400 400"
              >
                <defs>
                  {/* Gradient for spiral arms */}
                  <linearGradient id="spiralGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6265fe" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#7d85d0" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#b6bbff" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="spiralGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7d85d0" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#6265fe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#b9f0d7" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="spiralGradient3" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#b6bbff" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#7d85d0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6265fe" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="spiralGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Spiral arm 1 */}
                <path
                  d="M200,200 Q220,180 250,170 Q300,150 340,180 Q380,220 360,280 Q340,340 280,360 Q220,380 170,340 Q120,300 140,240 Q160,180 200,160 Q260,130 320,160 Q380,200 360,280 Q340,360 260,380"
                  fill="none"
                  stroke="url(#spiralGradient1)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter="url(#spiralGlow)"
                  opacity="0.9"
                />

                {/* Spiral arm 2 */}
                <path
                  d="M200,200 Q180,220 170,250 Q150,300 180,340 Q220,380 280,360 Q340,340 360,280 Q380,220 340,170 Q300,120 240,140 Q180,160 160,200 Q130,260 160,320 Q200,380 280,360"
                  fill="none"
                  stroke="url(#spiralGradient2)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  filter="url(#spiralGlow)"
                  opacity="0.8"
                />

                {/* Spiral arm 3 */}
                <path
                  d="M200,200 Q180,180 150,170 Q100,150 60,180 Q20,220 40,280 Q60,340 120,360 Q180,380 230,340 Q280,300 260,240 Q240,180 200,160 Q140,130 80,160 Q20,200 40,280 Q60,360 140,380"
                  fill="none"
                  stroke="url(#spiralGradient3)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#spiralGlow)"
                  opacity="0.7"
                />
              </svg>

              {/* Secondary spiral layer - counter-rotating */}
              <svg
                className="absolute inset-[5%] w-[90%] h-[90%] animate-[spin_45s_linear_infinite_reverse]"
                viewBox="0 0 400 400"
              >
                <defs>
                  <linearGradient id="innerSpiral1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7d85d0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#6265fe" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="innerSpiral2" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#6265fe" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#b6bbff" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                <path
                  d="M200,200 Q230,170 270,165 Q330,160 360,210 Q380,270 340,320 Q290,370 220,360 Q150,340 130,280 Q110,210 160,160 Q220,110 300,130"
                  fill="none"
                  stroke="url(#innerSpiral1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                <path
                  d="M200,200 Q170,230 165,270 Q160,330 210,360 Q270,380 320,340 Q370,290 360,220 Q340,150 280,130 Q210,110 160,160 Q110,220 130,300"
                  fill="none"
                  stroke="url(#innerSpiral2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>

              {/* Inner spiral layer - faster rotation */}
              <svg
                className="absolute inset-[15%] w-[70%] h-[70%] animate-[spin_30s_linear_infinite]"
                viewBox="0 0 400 400"
              >
                <defs>
                  <linearGradient id="coreSpiral" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b6bbff" stopOpacity="1" />
                    <stop offset="50%" stopColor="#7d85d0" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#6265fe" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                <path
                  d="M200,200 Q240,160 280,170 Q340,190 350,250 Q350,320 290,350 Q220,370 160,330 Q110,280 130,210 Q160,140 230,130 Q310,130 350,200"
                  fill="none"
                  stroke="url(#coreSpiral)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>

              {/* Particle/star field overlay */}
              <div className="absolute inset-0 animate-[spin_90s_linear_infinite_reverse]">
                <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 bg-[#b6bbff] rounded-full shadow-[0_0_6px_#b6bbff]" />
                <div className="absolute top-[25%] right-[18%] w-1 h-1 bg-[#6265fe] rounded-full shadow-[0_0_4px_#6265fe]" />
                <div className="absolute bottom-[20%] left-[15%] w-1 h-1 bg-[#7d85d0] rounded-full shadow-[0_0_4px_#7d85d0]" />
                <div className="absolute bottom-[30%] right-[22%] w-1.5 h-1.5 bg-[#b9f0d7] rounded-full shadow-[0_0_6px_#b9f0d7]" />
                <div className="absolute top-[40%] left-[10%] w-1 h-1 bg-[#6265fe] rounded-full shadow-[0_0_4px_#6265fe]" />
                <div className="absolute top-[60%] right-[12%] w-1 h-1 bg-[#b6bbff] rounded-full shadow-[0_0_4px_#b6bbff]" />
              </div>

              {/* Orbiting planets */}
              <div className="absolute inset-[5%] animate-[spin_50s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-[#6265fe] to-[#4a4dd9] rounded-full shadow-[0_0_10px_#6265fe]" />
              </div>
              <div className="absolute inset-[10%] animate-[spin_40s_linear_infinite_reverse]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-gradient-to-br from-[#b9f0d7] to-[#8ae0c0] rounded-full shadow-[0_0_8px_#b9f0d7]" />
              </div>
              <div className="absolute inset-[20%] animate-[spin_35s_linear_infinite]">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-gradient-to-br from-[#7d85d0] to-[#5a63b8] rounded-full shadow-[0_0_8px_#7d85d0]" />
              </div>
              <div className="absolute inset-[25%] animate-[spin_28s_linear_infinite_reverse]">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-br from-[#b6bbff] to-[#9ba0e6] rounded-full shadow-[0_0_8px_#b6bbff]" />
              </div>

              {/* Center core with gradient glow */}
              <div className="absolute inset-[42%] rounded-full bg-gradient-to-br from-[#6265fe]/30 to-[#7d85d0]/20 blur-sm" />
              <div className="absolute inset-[44%] rounded-full bg-gradient-to-br from-[#7d85d0]/50 to-[#6265fe]/30 shadow-[0_0_40px_rgba(98,101,254,0.4)]" />
              <div className="absolute inset-[46%] rounded-full bg-gradient-to-br from-[#b6bbff]/60 to-[#7d85d0]/40 shadow-[0_0_25px_rgba(182,187,255,0.6)]" />
              <div className="absolute inset-[48%] rounded-full bg-[#fff]/30 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        </div>

        {/* Stats/Features Grid */}
        <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Card 1 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(98,101,254,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#6265fe]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Connect</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Link your wallet. Enter the Console.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7d85d0]/20 to-[#7d85d0]/5 border border-[#7d85d0]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(125,133,208,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#7d85d0]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Verify</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Post verification. Submit proof.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group glass-card p-6 hover-lift opacity-0 animate-fade-in-up cursor-default" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/20 to-[#b9f0d7]/5 border border-[#b9f0d7]/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(185,240,215,0.3)] transition-all duration-300">
              <span className="text-2xl font-bold text-[#b9f0d7]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#c9e8ff] transition-colors">Coordinate</h3>
            <p className="text-sm text-[#b6bbff]/50 leading-relaxed">
              Complete tasks. Collect points.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap items-center gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Infrastructure</span>
          </div>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Coordination, Not Extraction</span>
          </div>
          <div className="flex items-center gap-2 text-[#7d85d0]/50 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Depth That Holds</span>
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
