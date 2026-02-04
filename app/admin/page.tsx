'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

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

export default function AdminPage() {
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

  useEffect(() => {
    if (address) {
      checkAdminStatus();
    }
  }, [address]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch(`/api/admin/check?wallet=${address}`);
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) {
        fetchCampaignStatus();
        fetchUsers();
        fetchSubmissions();
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStatus = async () => {
    const res = await fetch('/api/campaign-status');
    const data = await res.json();
    setCampaignLive(data.live);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (data.ok) setUsers(data.data);
  };

  const fetchSubmissions = async () => {
    const res = await fetch(`/api/operator/submissions?operator_id=${address}`);
    const data = await res.json();
    if (data.ok) setSubmissions(data.data);
  };

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
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
        </div>
        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#7d85d0]/20 border border-[#7d85d0]/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Admin Panel
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">Connect your wallet to access admin features</p>
          <ConnectButton />
        </div>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070713] text-white">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff5252] rounded-full opacity-10 blur-[100px]" />
        </div>
        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff5252]/20 to-transparent border border-[#ff5252]/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#ff5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Access Denied
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">You do not have admin privileges.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070713] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#6265fe] rounded-full opacity-5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#b9f0d7] rounded-full opacity-5 blur-[100px]" />
      </div>

      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-[#7d85d0]/20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6265fe] to-[#b9f0d7] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
              Orvex
            </span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#6265fe]/20 text-[#b6bbff]">
              Admin
            </span>
          </div>
        </Link>
        <ConnectButton />
      </nav>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-81px)] border-r border-[#7d85d0]/20 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white shadow-[0_0_20px_rgba(98,101,254,0.3)]'
                    : 'text-[#b6bbff]/60 hover:bg-[#6265fe]/10 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'campaign' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-6">
                Campaign Control
              </h2>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg text-[#b6bbff]/80">Campaign Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${campaignLive ? 'bg-[#b9f0d7] animate-pulse' : 'bg-[#ff5252]'}`} />
                    <span className={`font-bold ${campaignLive ? 'text-[#b9f0d7]' : 'text-[#ff5252]'}`}>
                      {campaignLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleCampaign}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    campaignLive
                      ? 'bg-[#ff5252]/20 text-[#ff5252] border border-[#ff5252]/30 hover:bg-[#ff5252]/30'
                      : 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] text-white hover:shadow-[0_0_20px_rgba(185,240,215,0.3)]'
                  }`}
                >
                  {campaignLive ? 'Turn Off Campaign' : 'Turn On Campaign'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-6">
                User Management
              </h2>
              <input
                type="text"
                placeholder="Search by wallet address..."
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all mb-6 placeholder:text-[#7d85d0]/40"
              />
              <div className="overflow-x-auto rounded-xl border border-[#7d85d0]/20">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#6265fe]/10">
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Wallet</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Points</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">IP</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-[#7d85d0]/10 hover:bg-[#6265fe]/5 transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-[#c9e8ff]">
                          {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                        </td>
                        <td className="py-4 px-4 text-[#b9f0d7] font-medium">{user.points}</td>
                        <td className="py-4 px-4 text-[#7d85d0]">{user.ip_address || 'N/A'}</td>
                        <td className="py-4 px-4">
                          {user.is_banned ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-[#ff5252]/15 text-[#ff5252] border border-[#ff5252]/30">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-[#b9f0d7]/15 text-[#b9f0d7] border border-[#b9f0d7]/30">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleBan(user.id, user.is_banned)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              user.is_banned
                                ? 'bg-[#b9f0d7]/10 text-[#b9f0d7] border border-[#b9f0d7]/30 hover:bg-[#b9f0d7]/20'
                                : 'bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/30 hover:bg-[#ff5252]/20'
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
                  Recent Submissions
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#b6bbff]/60">AI Review</span>
                  <button
                    onClick={() => setAiReviewEnabled(!aiReviewEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      aiReviewEnabled
                        ? 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe]'
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
                <div className="mb-6 p-4 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/30 text-[#c9e8ff] text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#6265fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  AI Review is enabled. Submissions will be automatically verified. (Coming soon)
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-[#7d85d0]/20">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#6265fe]/10">
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">ID</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Category</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Proof</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Points</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Date</th>
                      {!aiReviewEnabled && (
                        <th className="text-left py-4 px-4 text-[#b6bbff]/60 font-medium">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 20).map((sub) => (
                      <tr key={sub.id} className="border-t border-[#7d85d0]/10 hover:bg-[#6265fe]/5 transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-[#c9e8ff]">{sub.id.slice(0, 8)}...</td>
                        <td className="py-4 px-4 text-white">{sub.task_category}</td>
                        <td className="py-4 px-4">
                          {sub.link_url ? (
                            <a
                              href={sub.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6265fe] hover:text-[#7d85d0] transition-colors text-sm flex items-center gap-1"
                            >
                              View Link
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[#7d85d0] text-sm">Screenshot</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#b9f0d7] font-medium">{sub.cp_reward}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
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
                        <td className="py-4 px-4 text-[#7d85d0] text-sm">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        {!aiReviewEnabled && (
                          <td className="py-4 px-4">
                            {sub.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => approveSubmission(sub.id)}
                                  disabled={reviewingId === sub.id}
                                  className="px-4 py-1.5 bg-[#b9f0d7]/10 text-[#b9f0d7] border border-[#b9f0d7]/30 rounded-lg text-sm font-medium hover:bg-[#b9f0d7]/20 transition-all disabled:opacity-50"
                                >
                                  {reviewingId === sub.id ? '...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => rejectSubmission(sub.id)}
                                  disabled={reviewingId === sub.id}
                                  className="px-4 py-1.5 bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/30 rounded-lg text-sm font-medium hover:bg-[#ff5252]/20 transition-all disabled:opacity-50"
                                >
                                  {reviewingId === sub.id ? '...' : 'Deny'}
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
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-6">
                Adjust Points
              </h2>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 max-w-md space-y-4">
                <div>
                  <label className="block text-sm text-[#b6bbff]/60 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={pointsWallet}
                    onChange={(e) => setPointsWallet(e.target.value)}
                    className="w-full px-4 py-3 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b6bbff]/60 mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPointsAction('add')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      pointsAction === 'add'
                        ? 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] text-white'
                        : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setPointsAction('remove')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      pointsAction === 'remove'
                        ? 'bg-gradient-to-r from-[#ff5252] to-[#ff5252]/60 text-white'
                        : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20'
                    }`}
                  >
                    Remove
                  </button>
                </div>
                <button
                  onClick={adjustPoints}
                  className="w-full py-3 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
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
