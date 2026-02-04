'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';

interface UserData {
  wallet_address: string;
  points: number;
  registration_complete: boolean;
  tasks_completed: number;
}

interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  status: 'available' | 'pending' | 'completed';
}

interface LeaderboardEntry {
  rank: number;
  wallet_address: string;
  points: number;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaignLive, setCampaignLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userLeaderboardEntry, setUserLeaderboardEntry] = useState<LeaderboardEntry | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    if (address) {
      fetchUserData();
      fetchTasks();
      checkCampaignStatus();
      fetchLeaderboard();

      // Refresh leaderboard every 30 minutes
      const interval = setInterval(() => {
        fetchLeaderboard();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [address]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/user?wallet=${address}`);
      const data = await res.json();
      if (data.ok) {
        setUserData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?wallet=${address}`);
      const data = await res.json();
      if (data.ok) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const checkCampaignStatus = async () => {
    try {
      const res = await fetch('/api/campaign-status');
      const data = await res.json();
      setCampaignLive(data.live);
    } catch {
      setCampaignLive(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard?limit=50');
      const data = await res.json();
      if (data.ok) {
        setLeaderboard(data.data);
        setLastUpdated(new Date(data.lastUpdated));
        // Find current user's rank and entry
        if (address) {
          const userEntry = data.data.find(
            (entry: LeaderboardEntry) => entry.wallet_address.toLowerCase() === address.toLowerCase()
          );
          setUserRank(userEntry?.rank || null);
          setUserLeaderboardEntry(userEntry || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
        <AnimatedBackground />
        <CursorGlow color="rgba(98, 101, 254, 0.1)" size={400} blur={80} />
        <div className="noise-overlay" />

        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6265fe] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Image src="/logo.svg" alt="Orvex" width={36} height={36} className="relative rounded-full" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">Orvex</span>
          </Link>
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-24">
          <div className="glass-card p-12 max-w-md w-full text-center opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#6265fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-3">Connect Wallet</h1>
            <p className="text-[#b6bbff]/50 text-sm mb-8">Connect your wallet to enter the Console</p>
            <ConnectButton />
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
        <AnimatedBackground />
        <div className="noise-overlay" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin mb-4" />
          <span className="text-[#b6bbff]/50 text-sm">Loading Console...</span>
        </div>
      </div>
    );
  }

  // Not registered state
  if (!userData?.registration_complete) {
    return (
      <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
        <AnimatedBackground />
        <CursorGlow color="rgba(255, 193, 7, 0.08)" size={400} blur={80} />
        <div className="noise-overlay" />

        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6265fe] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Image src="/logo.svg" alt="Orvex" width={36} height={36} className="relative rounded-full" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">Orvex</span>
          </Link>
          <ConnectButton />
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-24">
          <div className="glass-card p-12 max-w-md w-full text-center opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffc107]/20 to-[#ffc107]/5 border border-[#ffc107]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-3">Complete Registration</h1>
            <p className="text-[#b6bbff]/50 text-sm mb-8">Verify your X account to enter the Console.</p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Complete Registration
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-[#070713] text-white overflow-hidden">
      <AnimatedBackground />
      <CursorGlow color="rgba(98, 101, 254, 0.08)" size={500} blur={100} />
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-[#7d85d0]/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#6265fe] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            <Image src="/logo.svg" alt="Orvex" width={36} height={36} className="relative rounded-full" />
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text">Orvex</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-[#b9f0d7]/20">
            <svg className="w-4 h-4 text-[#b9f0d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-[#b9f0d7]">{(userData?.points || 0).toLocaleString()}</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Welcome header */}
        <div className="mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Console</h1>
          <p className="text-[#b6bbff]/50">Coordinate. Complete tasks. Earn points.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Points Card */}
          <div className="glass-card p-6 hover-lift opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6265fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[#b6bbff]/50 text-sm">Total Points</span>
            </div>
            <div className="text-4xl font-bold gradient-text-accent">{(userData?.points || 0).toLocaleString()}</div>
          </div>

          {/* Tasks Completed Card */}
          <div className="glass-card p-6 hover-lift opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7d85d0]/20 to-[#7d85d0]/5 border border-[#7d85d0]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[#b6bbff]/50 text-sm">Tasks Completed</span>
            </div>
            <div className="text-4xl font-bold text-[#c9e8ff]">{userData?.tasks_completed || 0}</div>
          </div>

          {/* Campaign Status Card */}
          <div className="glass-card p-6 hover-lift opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${campaignLive ? 'bg-gradient-to-br from-[#b9f0d7]/20 to-[#b9f0d7]/5 border-[#b9f0d7]/20' : 'bg-gradient-to-br from-[#7d85d0]/20 to-[#7d85d0]/5 border-[#7d85d0]/20'}`}>
                <div className={`w-3 h-3 rounded-full ${campaignLive ? 'bg-[#b9f0d7] animate-pulse shadow-[0_0_10px_rgba(185,240,215,0.5)]' : 'bg-[#7d85d0]/50'}`} />
              </div>
              <span className="text-[#b6bbff]/50 text-sm">Campaign Status</span>
            </div>
            <div className={`text-4xl font-bold ${campaignLive ? 'text-[#b9f0d7]' : 'text-[#7d85d0]/60'}`}>
              {campaignLive ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          {/* Leaderboard Card */}
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="glass-card p-6 hover-lift opacity-0 animate-fade-in-up text-left cursor-pointer group transition-all duration-300 hover:border-[#b9f0d7]/30"
            style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/20 to-[#b9f0d7]/5 border border-[#b9f0d7]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#b9f0d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b6bbff]/50 text-sm">Leaderboard</span>
                <svg className="w-4 h-4 text-[#b6bbff]/30 group-hover:text-[#b9f0d7] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-[#b9f0d7]">
              {userRank ? `#${userRank}` : '—'}
            </div>
            <div className="text-[10px] text-[#b6bbff]/30 mt-1 uppercase tracking-wider">Your Rank</div>
          </button>
        </div>

        {/* Tasks Section */}
        <div className="mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <h2 className="text-2xl font-bold gradient-text">Available Tasks</h2>
        </div>

        {!campaignLive ? (
          <div className="glass-card p-12 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6265fe]/20 to-[#7d85d0]/10 border border-[#7d85d0]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Campaign Not Live Yet</h3>
            <p className="text-[#b6bbff]/50 text-sm max-w-sm mx-auto">
              Tasks available when the Vortex opens. Stand by.
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card p-12 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <p className="text-[#b6bbff]/50">No tasks available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="glass-card p-6 hover-lift opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${600 + index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block text-[10px] px-3 py-1 rounded-full bg-[#6265fe]/20 text-[#b6bbff]/70 uppercase tracking-wider font-medium mb-3">
                      {task.category}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#b9f0d7]">+{task.points}</div>
                    <div className="text-[10px] text-[#7d85d0] uppercase tracking-wider">points</div>
                  </div>
                </div>
                <p className="text-[#b6bbff]/50 text-sm mb-6 leading-relaxed">{task.description}</p>

                {task.status === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#b9f0d7]/10 border border-[#b9f0d7]/20 text-[#b9f0d7] font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </div>
                ) : task.status === 'pending' ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20 text-[#ffc107] font-medium">
                    <div className="w-4 h-4 rounded-full border-2 border-[#ffc107]/30 border-t-[#ffc107] animate-spin" />
                    Pending Review
                  </div>
                ) : (
                  <Link
                    href={`/submit?task=${task.id}`}
                    className="group flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300"
                  >
                    Start Task
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLeaderboardModal(false)}
          />

          {/* Modal */}
          <div className="relative glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#7d85d0]/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Leaderboard</h2>
                {lastUpdated && (
                  <p className="text-[#7d85d0] text-xs mt-1">
                    Updates every 30 min • Last: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="w-10 h-10 rounded-xl bg-[#7d85d0]/10 hover:bg-[#7d85d0]/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-[#b6bbff]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-16 text-[#b6bbff]/50">
                  No participants yet. Be the first!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#0d0d1a]">
                      <tr className="border-b border-[#7d85d0]/10">
                        <th className="text-left py-4 px-6 text-[#b6bbff]/50 text-xs uppercase tracking-wider font-medium">Rank</th>
                        <th className="text-left py-4 px-6 text-[#b6bbff]/50 text-xs uppercase tracking-wider font-medium">Wallet</th>
                        <th className="text-right py-4 px-6 text-[#b6bbff]/50 text-xs uppercase tracking-wider font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* User's position always at top if not in top entries */}
                      {userLeaderboardEntry && userLeaderboardEntry.rank > 10 && (
                        <>
                          <tr className="bg-[#6265fe]/15 border-b-2 border-[#6265fe]/30">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6265fe] to-[#7d85d0] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(98,101,254,0.5)]">
                                  {userLeaderboardEntry.rank}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-[#6265fe] font-semibold">
                                  {userLeaderboardEntry.wallet_address.slice(0, 6)}...{userLeaderboardEntry.wallet_address.slice(-4)}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6265fe]/30 text-[#6265fe] font-bold">
                                  YOU
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-bold text-[#6265fe]">
                                {userLeaderboardEntry.points.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="py-2 px-6 text-center text-[#7d85d0]/40 text-xs">
                              • • •
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Main leaderboard */}
                      {leaderboard.map((entry) => {
                        const isCurrentUser = address && entry.wallet_address.toLowerCase() === address.toLowerCase();
                        const isTop3 = entry.rank <= 3;

                        return (
                          <tr
                            key={entry.wallet_address}
                            className={`border-b border-[#7d85d0]/5 transition-all duration-200 ${
                              isCurrentUser
                                ? 'bg-[#6265fe]/15'
                                : 'hover:bg-[#6265fe]/5'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {entry.rank === 1 ? (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] flex items-center justify-center text-sm font-bold text-[#070713] shadow-[0_0_15px_rgba(185,240,215,0.4)]">
                                    1
                                  </div>
                                ) : entry.rank === 2 ? (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9e8ff] to-[#7d85d0] flex items-center justify-center text-sm font-bold text-[#070713]">
                                    2
                                  </div>
                                ) : entry.rank === 3 ? (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7d85d0] to-[#6265fe] flex items-center justify-center text-sm font-bold text-white">
                                    3
                                  </div>
                                ) : (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCurrentUser ? 'bg-gradient-to-br from-[#6265fe] to-[#7d85d0] text-white' : 'bg-[#7d85d0]/10 text-[#7d85d0]'}`}>
                                    {entry.rank}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-sm ${isCurrentUser ? 'text-[#6265fe] font-semibold' : 'text-[#c9e8ff]'}`}>
                                  {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6265fe]/30 text-[#6265fe] font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`font-bold ${isCurrentUser ? 'text-[#6265fe]' : isTop3 ? 'text-[#b9f0d7]' : 'text-white'}`}>
                                {entry.points.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
