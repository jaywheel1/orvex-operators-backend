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
  status: string;
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

  const filteredUsers = searchWallet
    ? users.filter((u) => u.wallet_address.toLowerCase().includes(searchWallet.toLowerCase()))
    : users;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <ConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-zinc-400 mb-8">You do not have admin privileges.</p>
        <Link href="/" className="text-blue-500 hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="text-2xl font-bold">ORVEX ADMIN</Link>
        <ConnectButton />
      </nav>

      <div className="flex">
        <aside className="w-64 border-r border-zinc-800 min-h-screen p-4">
          <nav className="space-y-2">
            {(['campaign', 'users', 'submissions', 'points'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg capitalize ${
                  activeTab === tab ? 'bg-white text-black' : 'hover:bg-zinc-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'campaign' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Campaign Control</h2>
              <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg">Campaign Status</span>
                  <span className={`font-bold ${campaignLive ? 'text-green-500' : 'text-red-500'}`}>
                    {campaignLive ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
                <button
                  onClick={toggleCampaign}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    campaignLive
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {campaignLive ? 'Turn Off Campaign' : 'Turn On Campaign'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">User Management</h2>
              <input
                type="text"
                placeholder="Search by wallet address..."
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-6"
              />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4">Wallet</th>
                      <th className="text-left py-3 px-4">Points</th>
                      <th className="text-left py-3 px-4">IP</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800">
                        <td className="py-3 px-4 font-mono text-sm">
                          {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                        </td>
                        <td className="py-3 px-4">{user.points}</td>
                        <td className="py-3 px-4 text-zinc-500">{user.ip_address || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {user.is_banned ? (
                            <span className="text-red-500">Banned</span>
                          ) : (
                            <span className="text-green-500">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleBan(user.id, user.is_banned)}
                            className={`px-3 py-1 rounded text-sm ${
                              user.is_banned
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
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
              <h2 className="text-2xl font-bold mb-6">Recent Submissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 20).map((sub) => (
                      <tr key={sub.id} className="border-b border-zinc-800">
                        <td className="py-3 px-4 font-mono text-sm">{sub.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{sub.task_category}</td>
                        <td className="py-3 px-4">{sub.task_type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              sub.status === 'approved'
                                ? 'bg-green-500/20 text-green-500'
                                : sub.status === 'rejected'
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Adjust Points</h2>
              <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 max-w-md space-y-4">
                <input
                  type="text"
                  placeholder="Wallet address"
                  value={pointsWallet}
                  onChange={(e) => setPointsWallet(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setPointsAction('add')}
                    className={`flex-1 py-2 rounded-lg ${
                      pointsAction === 'add' ? 'bg-green-500' : 'bg-zinc-800'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setPointsAction('remove')}
                    className={`flex-1 py-2 rounded-lg ${
                      pointsAction === 'remove' ? 'bg-red-500' : 'bg-zinc-800'
                    }`}
                  >
                    Remove
                  </button>
                </div>
                <button
                  onClick={adjustPoints}
                  className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
