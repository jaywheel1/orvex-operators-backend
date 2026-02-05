'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface User {
  id: string;
  wallet_address: string;
  points: number;
  registration_complete: boolean;
  is_banned: boolean;
  ip_address: string | null;
  created_at: string;
}

interface Submission {
  id: string;
  user_id: string;
  task_category: string;
  task_type: string;
  proof: string;
  link_url: string | null;
  status: string;
  cp_reward: number;
  created_at: string;
}

function AdminPageContent() {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaign' | 'users' | 'submissions' | 'points'>('campaign');
  const [campaignLive, setCampaignLive] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchWallet, setSearchWallet] = useState('');
  const [pointsWallet, setPointsWallet] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsAction, setPointsAction] = useState<'add' | 'remove'>('add');
  const [aiReviewEnabled, setAiReviewEnabled] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchCampaignStatus = useCallback(async () => {
    const res = await fetch('/api/campaign-status');
    const data = await res.json();
    setCampaignLive(data.live);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users', {
      headers: { 'x-wallet-address': address || '' },
    });
    const data = await res.json();
    if (data.ok) setUsers(data.data);
  }, [address]);

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch(`/api/operator/submissions?operator_id=${address}`);
    const data = await res.json();
    if (data.ok) setSubmissions(data.data);
  }, [address]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch(`/api/admin/check?wallet=${address}`);
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        if (data.isAdmin) {
          await fetchCampaignStatus();
          await fetchUsers();
          await fetchSubmissions();
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      checkAdminStatus();
    }
  }, [address, fetchCampaignStatus, fetchUsers, fetchSubmissions]);

  const toggleCampaign = async () => {
    const res = await fetch('/api/admin/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ live: !campaignLive, admin_wallet: address }),
    });
    const data = await res.json();
    if (data.ok) setCampaignLive(!campaignLive);
  };

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    const res = await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ban: !currentBanned, admin_wallet: address }),
    });
    const data = await res.json();
    if (data.ok) fetchUsers();
  };

  const adjustPoints = async () => {
    if (!pointsWallet || !pointsAmount) return;
    const amount = parseInt(pointsAmount) * (pointsAction === 'remove' ? -1 : 1);
    const res = await fetch('/api/admin/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: pointsWallet,
        amount,
        admin_wallet: address,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setPointsWallet('');
      setPointsAmount('');
      fetchUsers();
    }
  };

  const approveSubmission = async (submissionId: string) => {
    setReviewingId(submissionId);
    try {
      const res = await fetch('/api/operator/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          operator_id: address,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchSubmissions();
      } else {
        alert(data.error || 'Failed to approve');
      }
    } finally {
      setReviewingId(null);
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    const reason = prompt('Rejection reason (optional):');
    setReviewingId(submissionId);
    try {
      const res = await fetch('/api/operator/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          operator_id: address,
          reason: reason || 'Rejected by admin',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchSubmissions();
      } else {
        alert(data.error || 'Failed to reject');
      }
    } finally {
      setReviewingId(null);
    }
  };

  const filteredUsers = searchWallet
    ? users.filter((u) => u.wallet_address.toLowerCase().includes(searchWallet.toLowerCase()))
    : users;

  const tabs = [
    { id: 'campaign', label: 'Campaign', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    )},
    { id: 'users', label: 'Users', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    )},
    { id: 'submissions', label: 'Submissions', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    )},
    { id: 'points', label: 'Points', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ] as const;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#070713] text-white">
        <AnimatedBackground />
        <CursorGlow />
        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#7d85d0]/20 border border-[#7d85d0]/30 flex items-center justify-center mb-6 mx-auto animate-float">
              <svg className="w-12 h-12 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Admin Panel
          </h1>
          <p className="text-[#b6bbff]/60 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Connect to access operator controls</p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070713] text-white flex items-center justify-center">
        <AnimatedBackground />
        <CursorGlow />
        <div className="relative flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-[#b9f0d7]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <span className="text-[#b6bbff]/60 animate-pulse">Verifying operator access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070713] text-white">
        <AnimatedBackground />
        <CursorGlow color="rgba(255, 82, 82, 0.1)" />
        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <div className="glass-card p-12 rounded-3xl text-center max-w-md mx-4 animate-fade-in-up">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff5252]/20 to-transparent border border-[#ff5252]/30 flex items-center justify-center mb-6 mx-auto animate-pulse">
              <svg className="w-12 h-12 text-[#ff5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
              Access Denied
            </h1>
            <p className="text-[#b6bbff]/60 mb-8">Operator credentials not found.</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-105 transition-all duration-300"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070713] text-white">
      <AnimatedBackground />
      <CursorGlow />

      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-[#7d85d0]/20 backdrop-blur-sm bg-[#070713]/50 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#6265fe] to-[#b9f0d7] rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300" />
            <Image src="/logo.svg" alt="Orvex" width={44} height={44} className="rounded-full relative" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
              Orvex
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#6265fe]/30 to-[#7d85d0]/30 text-[#b6bbff] border border-[#6265fe]/30 font-medium">
              Admin
            </span>
          </div>
        </Link>
        <ConnectButton />
      </nav>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-81px)] border-r border-[#7d85d0]/20 p-4 backdrop-blur-sm bg-[#070713]/30 z-10">
          <nav className="space-y-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 animate-fade-in-up ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white shadow-[0_0_30px_rgba(98,101,254,0.4)] scale-[1.02]'
                    : 'text-[#b6bbff]/60 hover:bg-[#6265fe]/10 hover:text-white hover:translate-x-1'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className={activeTab === tab.id ? 'animate-pulse' : ''}>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative z-10">
          {activeTab === 'campaign' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-8">
                Campaign Control
              </h2>
              <div className="glass-card p-8 rounded-2xl max-w-md hover-lift">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg text-[#b6bbff]/80">Campaign Status</span>
                  <div className="flex items-center gap-3">
                    <div className={`relative w-4 h-4 rounded-full ${campaignLive ? 'bg-[#b9f0d7]' : 'bg-[#ff5252]'}`}>
                      {campaignLive && <div className="absolute inset-0 rounded-full bg-[#b9f0d7] animate-ping opacity-50" />}
                    </div>
                    <span className={`font-bold text-lg ${campaignLive ? 'text-[#b9f0d7]' : 'text-[#ff5252]'}`}>
                      {campaignLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleCampaign}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    campaignLive
                      ? 'bg-[#ff5252]/20 text-[#ff5252] border border-[#ff5252]/30 hover:bg-[#ff5252]/30 hover:shadow-[0_0_20px_rgba(255,82,82,0.3)]'
                      : 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] text-white hover:shadow-[0_0_30px_rgba(185,240,215,0.4)] hover:scale-[1.02]'
                  }`}
                >
                  {campaignLive ? 'Turn Off Campaign' : 'Turn On Campaign'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-8">
                User Management
              </h2>
              <div className="relative max-w-md mb-8">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7d85d0]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by wallet address..."
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#070713]/50 backdrop-blur-sm border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
                />
              </div>
              <div className="glass-card overflow-hidden rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#6265fe]/20 to-[#7d85d0]/10">
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Wallet</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Points</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">IP</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Status</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-t border-[#7d85d0]/10 hover:bg-[#6265fe]/10 transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-4 px-5 font-mono text-sm text-[#c9e8ff]">
                          {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                        </td>
                        <td className="py-4 px-5 text-[#b9f0d7] font-bold">{user.points}</td>
                        <td className="py-4 px-5 text-[#7d85d0]">{user.ip_address || 'N/A'}</td>
                        <td className="py-4 px-5">
                          {user.is_banned ? (
                            <span className="px-3 py-1.5 rounded-full text-xs bg-[#ff5252]/15 text-[#ff5252] border border-[#ff5252]/30 font-medium">
                              Banned
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs bg-[#b9f0d7]/15 text-[#b9f0d7] border border-[#b9f0d7]/30 font-medium">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => toggleBan(user.id, user.is_banned)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              user.is_banned
                                ? 'bg-[#b9f0d7]/10 text-[#b9f0d7] border border-[#b9f0d7]/30 hover:bg-[#b9f0d7]/20 hover:shadow-[0_0_15px_rgba(185,240,215,0.2)]'
                                : 'bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/30 hover:bg-[#ff5252]/20 hover:shadow-[0_0_15px_rgba(255,82,82,0.2)]'
                            }`}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
                  Recent Submissions
                </h2>
                <div className="flex items-center gap-4 glass-card px-4 py-2.5 rounded-xl">
                  <span className="text-sm text-[#b6bbff]/80 font-medium">AI Review</span>
                  <button
                    onClick={() => setAiReviewEnabled(!aiReviewEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      aiReviewEnabled
                        ? 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] shadow-[0_0_15px_rgba(185,240,215,0.3)]'
                        : 'bg-[#7d85d0]/30'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
                        aiReviewEnabled ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {aiReviewEnabled && (
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-[#6265fe]/10 to-[#7d85d0]/5 border border-[#6265fe]/30 text-[#c9e8ff] flex items-center gap-4 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-lg bg-[#6265fe]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#6265fe] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">AI Review Enabled</p>
                    <p className="text-sm text-[#b6bbff]/60">Submissions will be automatically verified. (Coming soon)</p>
                  </div>
                </div>
              )}

              <div className="glass-card overflow-hidden rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#6265fe]/20 to-[#7d85d0]/10">
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">ID</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Category</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Proof</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Points</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Status</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Date</th>
                      {!aiReviewEnabled && (
                        <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 20).map((sub, index) => (
                      <tr
                        key={sub.id}
                        className="border-t border-[#7d85d0]/10 hover:bg-[#6265fe]/10 transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-4 px-5 font-mono text-sm text-[#c9e8ff]">{sub.id.slice(0, 8)}...</td>
                        <td className="py-4 px-5">
                          <span className="px-3 py-1 rounded-lg bg-[#6265fe]/10 text-white text-sm font-medium">
                            {sub.task_category}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {sub.link_url ? (
                            <a
                              href={sub.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6265fe] hover:text-[#b6bbff] transition-colors text-sm flex items-center gap-2 group"
                            >
                              View Link
                              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[#7d85d0] text-sm">Screenshot</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-[#b9f0d7] font-bold">{sub.cp_reward}</td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs border font-medium ${
                              sub.status === 'approved'
                                ? 'bg-[#b9f0d7]/15 text-[#b9f0d7] border-[#b9f0d7]/30'
                                : sub.status === 'rejected'
                                ? 'bg-[#ff5252]/15 text-[#ff5252] border-[#ff5252]/30'
                                : 'bg-[#ffc107]/15 text-[#ffc107] border-[#ffc107]/30'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#7d85d0] text-sm">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        {!aiReviewEnabled && (
                          <td className="py-4 px-5">
                            {sub.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => approveSubmission(sub.id)}
                                  disabled={reviewingId === sub.id}
                                  className="px-4 py-2 bg-[#b9f0d7]/10 text-[#b9f0d7] border border-[#b9f0d7]/30 rounded-lg text-sm font-medium hover:bg-[#b9f0d7]/20 hover:shadow-[0_0_15px_rgba(185,240,215,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {reviewingId === sub.id ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-3 h-3 border-2 border-[#b9f0d7]/30 border-t-[#b9f0d7] rounded-full animate-spin" />
                                    </span>
                                  ) : 'Accept'}
                                </button>
                                <button
                                  onClick={() => rejectSubmission(sub.id)}
                                  disabled={reviewingId === sub.id}
                                  className="px-4 py-2 bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/30 rounded-lg text-sm font-medium hover:bg-[#ff5252]/20 hover:shadow-[0_0_15px_rgba(255,82,82,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {reviewingId === sub.id ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-3 h-3 border-2 border-[#ff5252]/30 border-t-[#ff5252] rounded-full animate-spin" />
                                    </span>
                                  ) : 'Deny'}
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-8">
                Adjust Points
              </h2>
              <div className="glass-card p-8 rounded-2xl max-w-md space-y-6 hover-lift">
                <div>
                  <label className="block text-sm text-[#b6bbff]/80 font-medium mb-3">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={pointsWallet}
                    onChange={(e) => setPointsWallet(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b6bbff]/80 font-medium mb-3">Amount</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPointsAction('add')}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                      pointsAction === 'add'
                        ? 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] text-white shadow-[0_0_20px_rgba(185,240,215,0.3)]'
                        : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20 border border-[#7d85d0]/20'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add
                    </span>
                  </button>
                  <button
                    onClick={() => setPointsAction('remove')}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                      pointsAction === 'remove'
                        ? 'bg-gradient-to-r from-[#ff5252] to-[#ff5252]/60 text-white shadow-[0_0_20px_rgba(255,82,82,0.3)]'
                        : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20 border border-[#7d85d0]/20'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                      Remove
                    </span>
                  </button>
                </div>
                <button
                  onClick={adjustPoints}
                  disabled={!pointsWallet || !pointsAmount}
                  className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <AdminPageContent />
    </ErrorBoundary>
  );
}
