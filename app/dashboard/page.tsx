'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070713] text-white">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#b9f0d7] rounded-full opacity-10 blur-[100px]" />
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
        </nav>

        <main className="relative flex flex-col items-center justify-center px-8 py-32">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#b9f0d7]/20 border border-[#7d85d0]/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Connect Wallet to Continue
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">Connect your wallet to access your dashboard</p>
          <ConnectButton />
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070713] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#6265fe] border-t-transparent animate-spin" />
          <span className="text-[#b6bbff]/60">Loading...</span>
        </div>
      </div>
    );
  }

  if (!userData?.registration_complete) {
    return (
      <div className="min-h-screen bg-[#070713] text-white">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
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
          <ConnectButton />
        </nav>

        <main className="relative flex flex-col items-center justify-center px-8 py-32">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffc107]/20 to-transparent border border-[#ffc107]/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Complete Registration First
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">You need to verify your X account before accessing the dashboard.</p>
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
          >
            Complete Registration
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070713] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6265fe] rounded-full opacity-5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b9f0d7] rounded-full opacity-5 blur-[100px]" />
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
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b9f0d7]/10 to-[#6265fe]/10 border border-[#7d85d0]/20">
            <span className="text-[#b6bbff]/60 text-sm">Points: </span>
            <span className="font-bold text-[#b9f0d7]">{userData?.points || 0}</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#6265fe]/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#6265fe]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6265fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[#b6bbff]/60 text-sm">Total Points</span>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-[#6265fe] to-[#b9f0d7] bg-clip-text text-transparent">
              {userData?.points || 0}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7d85d0]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#7d85d0]/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7d85d0]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[#b6bbff]/60 text-sm">Tasks Completed</span>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-[#7d85d0] to-[#c9e8ff] bg-clip-text text-transparent">
              {userData?.tasks_completed || 0}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#b9f0d7]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#b9f0d7]/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${campaignLive ? 'bg-[#b9f0d7]/20' : 'bg-[#7d85d0]/20'}`}>
                <div className={`w-3 h-3 rounded-full ${campaignLive ? 'bg-[#b9f0d7] animate-pulse' : 'bg-[#7d85d0]'}`} />
              </div>
              <span className="text-[#b6bbff]/60 text-sm">Campaign Status</span>
            </div>
            <div className={`text-4xl font-bold ${campaignLive ? 'text-[#b9f0d7]' : 'text-[#7d85d0]'}`}>
              {campaignLive ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
            Available Tasks
          </h2>
        </div>

        {!campaignLive ? (
          <div className="p-12 rounded-2xl bg-gradient-to-br from-[#6265fe]/5 to-transparent border border-[#7d85d0]/20 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#7d85d0]/20 border border-[#7d85d0]/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Campaign Not Live Yet</h3>
            <p className="text-[#b6bbff]/60">
              Tasks will be available when the campaign goes live. Check back soon!
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-gradient-to-br from-[#6265fe]/5 to-transparent border border-[#7d85d0]/20 text-center">
            <p className="text-[#b6bbff]/60">No tasks available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 hover:border-[#6265fe]/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#6265fe]/20 text-[#b6bbff] uppercase tracking-wide mb-3">
                      {task.category}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#b9f0d7]">+{task.points}</div>
                    <div className="text-xs text-[#7d85d0]">points</div>
                  </div>
                </div>
                <p className="text-[#b6bbff]/60 text-sm mb-6">{task.description}</p>

                {task.status === 'completed' ? (
                  <div className="px-4 py-3 rounded-xl bg-[#b9f0d7]/10 border border-[#b9f0d7]/30 text-[#b9f0d7] text-center font-medium">
                    Completed
                  </div>
                ) : task.status === 'pending' ? (
                  <div className="px-4 py-3 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/30 text-[#ffc107] text-center font-medium">
                    Pending Review
                  </div>
                ) : (
                  <Link
                    href={`/submit?task=${task.id}`}
                    className="block px-4 py-3 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl text-center hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
                  >
                    Start Task
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
