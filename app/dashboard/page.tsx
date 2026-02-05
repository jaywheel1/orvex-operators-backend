'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';
import {
  CATEGORIES,
  getTasksByCategory,
  getUserRank,
  getNextRank,
  getRankProgress,
  type TaskCategory,
  type TaskDefinition,
} from '@/lib/tasks-config';

// Task Card Component
function TaskCard({ task }: { task: TaskDefinition }) {
  const isLocked = task.status === 'coming_soon';
  const isOnce = task.frequency === 'once';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isLocked
          ? 'bg-[#0d0d1a]/50 border-[#7d85d0]/10 opacity-60'
          : 'bg-[#0d0d1a]/80 border-[#7d85d0]/20 hover:border-[#6265fe]/30'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${isLocked ? 'text-[#7d85d0]/70' : 'text-white'}`}>
              {task.name}
            </h4>
          </div>
          <p className={`text-xs ${isLocked ? 'text-[#7d85d0]/40' : 'text-[#b6bbff]/50'}`}>
            {task.description}
          </p>
        </div>
        <div className="text-right ml-3">
          <div className={`text-lg font-bold ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#b9f0d7]'}`}>
            +{task.cp_reward}
          </div>
          <div className="text-[9px] text-[#7d85d0] uppercase">CP</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#7d85d0]/10">
        <div className="flex items-center gap-2">
          {/* Frequency Tag */}
          {isOnce ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6265fe]/10 text-[#6265fe]">
              One-time
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffc107]/10 text-[#ffc107] flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {task.frequency === 'daily' ? 'Daily' : task.frequency === 'weekly' ? 'Weekly' : 'Repeatable'}
            </span>
          )}
          {/* Cap */}
          {task.cap > 1 && (
            <span className="text-[10px] text-[#7d85d0]">
              Max {task.cap}x
            </span>
          )}
        </div>
        {/* Action */}
        {isLocked ? (
          <span className="text-[10px] text-[#7d85d0] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked
          </span>
        ) : (
          <a
            href={`/submit?task=${task.id}`}
            className="text-[10px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white font-medium hover:shadow-[0_0_15px_rgba(98,101,254,0.3)] transition-all"
          >
            Start
          </a>
        )}
      </div>
    </div>
  );
}

interface UserData {
  wallet_address: string;
  points: number;
  registration_complete: boolean;
  tasks_completed: number;
  referral_code?: string;
  referral_count?: number;
}

interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  verified_referrals: number;
  remaining_slots: number;
  max_referrals: number;
  cp_per_referral: number;
  total_cp_earned: number;
}

interface LeaderboardEntry {
  rank: number;
  wallet_address: string;
  points: number;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [campaignLive, setCampaignLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userLeaderboardEntry, setUserLeaderboardEntry] = useState<LeaderboardEntry | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<TaskCategory>>(new Set(['social']));
  const [showNewReferralNotification, setShowNewReferralNotification] = useState(false);
  const [newReferralCount, setNewReferralCount] = useState(0);

  // Rank calculations
  const userCP = userData?.points || 0;
  const currentRank = getUserRank(userCP);
  const nextRank = getNextRank(userCP);
  const rankProgress = getRankProgress(userCP);

  const toggleCategory = (category: TaskCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const fetchUserData = useCallback(async () => {
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
  }, [address]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?wallet=${address}`);
      const data = await res.json();
      if (data.ok) {
        // Tasks are fetched but not used in this component
        // They are displayed through the CATEGORIES and getTasksByCategory functions
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [address]);

  const checkCampaignStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/campaign-status');
      const data = await res.json();
      setCampaignLive(data.live);
    } catch {
      setCampaignLive(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
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
  }, [address]);

  const fetchReferralStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/referral/stats?wallet=${address}`);
      const data = await res.json();
      if (data.ok) {
        setReferralStats(data.data);

        // Check for new referrals (client-side only)
        if (typeof window !== 'undefined') {
          const storageKey = `orvex_last_seen_referrals_${address?.toLowerCase()}`;
          const hasVisitedKey = `orvex_visited_${address?.toLowerCase()}`;
          const lastSeenCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
          const hasVisitedBefore = localStorage.getItem(hasVisitedKey) === 'true';
          const currentCount = data.data.verified_referrals || 0;

          if (hasVisitedBefore && currentCount > lastSeenCount) {
            // New referrals since last visit
            setNewReferralCount(currentCount - lastSeenCount);
            setShowNewReferralNotification(true);
          }

          // Update last seen count and mark as visited
          localStorage.setItem(storageKey, currentCount.toString());
          localStorage.setItem(hasVisitedKey, 'true');
        }
      }
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchUserData();
      fetchTasks();
      checkCampaignStatus();
      fetchLeaderboard();
      fetchReferralStats();

      // Refresh leaderboard every 30 minutes
      const interval = setInterval(() => {
        fetchLeaderboard();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [address, fetchUserData, fetchTasks, checkCampaignStatus, fetchLeaderboard, fetchReferralStats]);

  const copyReferralLink = async () => {
    if (referralStats?.referral_link) {
      await navigator.clipboard.writeText(referralStats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

        {/* Referral Section */}
        <div className="mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffc107]/20 to-[#ffc107]/5 border border-[#ffc107]/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Invite Friends</h3>
                  <p className="text-[#b6bbff]/50 text-sm">
                    Earn <span className="text-[#ffc107] font-semibold">1,000 CP</span> for each friend who registers (max 5)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d1a] border border-[#7d85d0]/20">
                  <span className="text-[#b6bbff]/70 text-sm font-mono">
                    {referralStats?.referral_code || '...'}
                  </span>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffc107] to-[#ffab00] text-[#070713] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all duration-300"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowReferralModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-[#7d85d0]/20 hover:border-[#ffc107]/30 text-[#b6bbff]/70 hover:text-white transition-all"
                >
                  <span className="font-semibold">{referralStats?.verified_referrals || 0}/5</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress Section */}
        <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}>
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6265fe]/30 to-[#7d85d0]/20 border border-[#6265fe]/30 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">{currentRank?.multiplier || 1}x</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{currentRank?.name || 'Recruit'}</h3>
                    {currentRank && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6265fe]/20 text-[#6265fe] font-medium uppercase">
                        {currentRank.multiplier}x Multiplier
                      </span>
                    )}
                  </div>
                  <p className="text-[#b6bbff]/50 text-sm">
                    {nextRank
                      ? `${(nextRank.cp_required - userCP).toLocaleString()} CP to ${nextRank.name}`
                      : 'Maximum rank achieved!'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#b6bbff]/50">Total CP</div>
                <div className="text-2xl font-bold gradient-text">{userCP.toLocaleString()}</div>
              </div>
            </div>
            {nextRank && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#b6bbff]/50">{currentRank?.name || 'Start'}</span>
                  <span className="text-[#6265fe]">{nextRank.name} ({nextRank.cp_required.toLocaleString()} CP)</span>
                </div>
                <div className="h-2 bg-[#0d0d1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6265fe] to-[#7d85d0] transition-all duration-500"
                    style={{ width: `${rankProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section Header */}
        <div className="mb-6 flex items-center justify-between opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <h2 className="text-2xl font-bold gradient-text">Operations</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#b9f0d7]/10 text-[#b9f0d7]">
              <span className="w-2 h-2 rounded-full bg-[#b9f0d7]" />
              Active
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#7d85d0]/10 text-[#7d85d0]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Coming Soon
            </span>
          </div>
        </div>

        {/* Task Categories */}
        <div className="space-y-4">
          {CATEGORIES.map((category, catIndex) => {
            const categoryTasks = getTasksByCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const isLocked = category.status === 'coming_soon';

            return (
              <div
                key={category.id}
                className="glass-card overflow-hidden opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${650 + catIndex * 50}ms`, animationFillMode: 'forwards' }}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-[#6265fe]/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isLocked
                        ? 'bg-[#7d85d0]/10 border border-[#7d85d0]/20'
                        : 'bg-gradient-to-br from-[#6265fe]/20 to-[#6265fe]/5 border border-[#6265fe]/20'
                    }`}>
                      {category.id === 'social' && (
                        <svg className={`w-6 h-6 ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#6265fe]'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {category.id === 'trading' && (
                        <svg className={`w-6 h-6 ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#6265fe]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                      {category.id === 'liquidity' && (
                        <svg className={`w-6 h-6 ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#6265fe]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                        </svg>
                      )}
                      {category.id === 'advanced' && (
                        <svg className={`w-6 h-6 ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#6265fe]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {category.id === 'consistency' && (
                        <svg className={`w-6 h-6 ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#6265fe]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isLocked ? 'text-[#7d85d0]/70' : 'text-white'}`}>
                          {category.name}
                        </h3>
                        {isLocked && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#7d85d0]/20 text-[#7d85d0]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isLocked ? 'text-[#7d85d0]/40' : 'text-[#b6bbff]/50'}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className={`text-lg font-bold ${isLocked ? 'text-[#7d85d0]/50' : 'text-[#b9f0d7]'}`}>
                        {category.max_cp.toLocaleString()} CP
                      </div>
                      <div className="text-[10px] text-[#7d85d0] uppercase">Max Possible</div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-[#7d85d0] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Category Tasks */}
                {isExpanded && (
                  <div className="border-t border-[#7d85d0]/10 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

      {/* New Referral Notification */}
      {showNewReferralNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - no click to dismiss, must use button */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <div className="relative glass-card w-full max-w-sm overflow-hidden rounded-2xl animate-scale-in">
            {/* Celebration effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffc107]/20 via-transparent to-[#b9f0d7]/20" />

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#ffc107] to-[#ffab00] flex items-center justify-center shadow-[0_0_40px_rgba(255,193,7,0.5)] animate-pulse">
                <svg className="w-10 h-10 text-[#070713]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                New Referral{newReferralCount > 1 ? 's' : ''}!
              </h2>

              {/* Message */}
              <p className="text-[#b6bbff]/70 mb-2">
                {newReferralCount} new friend{newReferralCount > 1 ? 's' : ''} joined using your link!
              </p>

              {/* Reward */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffc107]/20 border border-[#ffc107]/30 mb-6">
                <span className="text-[#ffc107] font-bold text-lg">+{(newReferralCount * 1000).toLocaleString()} CP</span>
                <span className="text-[#ffc107]/70 text-sm">earned!</span>
              </div>

              {/* Total stats */}
              <div className="p-4 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20 mb-6">
                <div className="text-[#b6bbff]/50 text-xs mb-1">Total Referral Earnings</div>
                <div className="text-2xl font-bold text-[#b9f0d7]">
                  {referralStats?.total_cp_earned?.toLocaleString() || 0} CP
                </div>
                <div className="text-[#b6bbff]/40 text-xs mt-1">
                  {referralStats?.verified_referrals || 0} of {referralStats?.max_referrals || 5} referrals completed
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowNewReferralNotification(false)}
                className="w-full py-3 bg-gradient-to-r from-[#ffc107] to-[#ffab00] text-[#070713] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,193,7,0.4)] transition-all duration-300"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReferralModal(false)}
          />

          {/* Modal */}
          <div className="relative glass-card w-full max-w-md overflow-hidden rounded-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#7d85d0]/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Your Referrals</h2>
                <p className="text-[#7d85d0] text-xs mt-1">
                  {referralStats?.verified_referrals || 0} of {referralStats?.max_referrals || 5} slots used
                </p>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="w-10 h-10 rounded-xl bg-[#7d85d0]/10 hover:bg-[#7d85d0]/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-[#b6bbff]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20">
                  <div className="text-[#b6bbff]/50 text-xs mb-1">Total Earned</div>
                  <div className="text-2xl font-bold text-[#ffc107]">
                    {referralStats?.total_cp_earned || 0} CP
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20">
                  <div className="text-[#b6bbff]/50 text-xs mb-1">Remaining</div>
                  <div className="text-2xl font-bold text-[#b6bbff]">
                    {referralStats?.remaining_slots || 5} slots
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Your Referral Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralStats?.referral_link || ''}
                    className="flex-1 px-4 py-3 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl text-sm text-[#c9e8ff] font-mono"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-3 bg-gradient-to-r from-[#ffc107] to-[#ffab00] text-[#070713] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Referral Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#b6bbff]/50">Progress</span>
                  <span className="text-[#ffc107]">
                    {referralStats?.verified_referrals || 0} / {referralStats?.max_referrals || 5} referrals
                  </span>
                </div>
                <div className="h-2 bg-[#0d0d1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffc107] to-[#ffab00] transition-all duration-500"
                    style={{ width: `${((referralStats?.verified_referrals || 0) / (referralStats?.max_referrals || 5)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#ffc107] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-[#ffc107]/80">
                    <p className="font-medium mb-1">How it works</p>
                    <p className="text-[#ffc107]/60">
                      Share your link with friends. When they complete registration, you earn {referralStats?.cp_per_referral || 1000} CP automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
