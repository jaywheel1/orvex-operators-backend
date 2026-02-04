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
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <Link href="/" className="text-2xl font-bold">ORVEX</Link>
        </nav>
        <main className="flex flex-col items-center justify-center px-8 py-32">
          <h1 className="text-3xl font-bold mb-6">Connect Wallet to Continue</h1>
          <ConnectButton />
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData?.registration_complete) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <Link href="/" className="text-2xl font-bold">ORVEX</Link>
          <ConnectButton />
        </nav>
        <main className="flex flex-col items-center justify-center px-8 py-32">
          <h1 className="text-3xl font-bold mb-6">Complete Registration First</h1>
          <p className="text-zinc-400 mb-8">You need to verify your X account before accessing the dashboard.</p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            Complete Registration
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="text-2xl font-bold">ORVEX</Link>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-zinc-900 rounded-lg">
            <span className="text-zinc-400">Points: </span>
            <span className="font-bold text-white">{userData?.points || 0}</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Total Points</div>
            <div className="text-3xl font-bold">{userData?.points || 0}</div>
          </div>
          <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Tasks Completed</div>
            <div className="text-3xl font-bold">{userData?.tasks_completed || 0}</div>
          </div>
          <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Campaign Status</div>
            <div className={`text-3xl font-bold ${campaignLive ? 'text-green-500' : 'text-zinc-500'}`}>
              {campaignLive ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Available Tasks</h2>

        {!campaignLive ? (
          <div className="p-8 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold mb-2">Campaign Not Live Yet</h3>
            <p className="text-zinc-400">
              Tasks will be available when the campaign goes live. Check back soon!
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
            <p className="text-zinc-400">No tasks available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 uppercase">
                      {task.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{task.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-500">+{task.points}</div>
                    <div className="text-xs text-zinc-500">points</div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{task.description}</p>
                {task.status === 'completed' ? (
                  <div className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-center">
                    Completed
                  </div>
                ) : task.status === 'pending' ? (
                  <div className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg text-center">
                    Pending Review
                  </div>
                ) : (
                  <Link
                    href={`/task/${task.id}`}
                    className="block px-4 py-2 bg-white text-black font-semibold rounded-lg text-center hover:bg-zinc-200 transition"
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
