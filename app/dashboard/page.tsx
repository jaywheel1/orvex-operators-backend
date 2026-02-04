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

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaignLive, setCampaignLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchUserData();
      fetchTasks();
      checkCampaignStatus();
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
            <p className="text-[#b6bbff]/50 text-sm mb-8">Connect your wallet to access your dashboard</p>
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
          <span className="text-[#b6bbff]/50 text-sm">Loading dashboard...</span>
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
            <p className="text-[#b6bbff]/50 text-sm mb-8">You need to verify your X account before accessing the dashboard.</p>
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
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Welcome back</h1>
          <p className="text-[#b6bbff]/50">Track your progress and complete tasks to earn rewards.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
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
              Tasks will be available when the campaign goes live. Check back soon!
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
    </div>
  );
}
