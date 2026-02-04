'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <div className="text-2xl font-bold">ORVEX</div>
        <Link
          href="/register"
          className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
        >
          Register
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center px-8 py-32">
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6">
          Complete Tasks.<br />Earn Rewards.
        </h1>
        <p className="text-xl text-zinc-400 text-center max-w-2xl mb-12">
          Join the Orvex community. Connect your wallet, verify your X account,
          and start earning points by completing social tasks.
        </p>

        <div className="flex gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-black font-semibold rounded-lg text-lg hover:bg-zinc-200 transition"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 border border-zinc-700 font-semibold rounded-lg text-lg hover:bg-zinc-900 transition"
          >
            View Dashboard
          </Link>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
            <p className="text-zinc-400">Link your wallet to get started with Orvex</p>
          </div>
          <div className="p-6 border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Verify X Account</h3>
            <p className="text-zinc-400">Post a verification tweet and submit proof</p>
          </div>
          <div className="p-6 border border-zinc-800 rounded-xl">
            <div className="text-3xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Earn Points</h3>
            <p className="text-zinc-400">Complete tasks and climb the leaderboard</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 px-8 py-6 text-center text-zinc-500">
        Orvex Operators 2026
      </footer>
    </div>
  );
}
