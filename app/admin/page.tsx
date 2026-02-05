'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';

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

interface AdminTask {
  id: string;
  task_key: string;
  name: string;
  description: string;
  category: string;
  type: string;
  points: number;
  verification_type: string;
  cap: number;
  frequency: string;
  metadata: Record<string, string>;
  status: string;
  active: boolean;
  created_at: string;
}

const EMPTY_TASK_FORM = {
  name: '',
  description: '',
  category: 'social',
  verification_type: 'manual' as string,
  points: 100,
  cap: 1,
  frequency: 'once' as string,
  metadata: {} as Record<string, string>,
  status: 'active' as string,
};

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaign' | 'users' | 'submissions' | 'points' | 'tasks'>('campaign');
  const [campaignLive, setCampaignLive] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchWallet, setSearchWallet] = useState('');
  const [pointsWallet, setPointsWallet] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsAction, setPointsAction] = useState<'add' | 'remove'>('add');
  const [aiReviewEnabled, setAiReviewEnabled] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Tasks management state
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [taskForm, setTaskForm] = useState({ ...EMPTY_TASK_FORM });
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');

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
        fetchTasks();
        fetchAiReviewStatus();
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

  const fetchTasks = async () => {
    const res = await fetch(`/api/admin/tasks?wallet=${address}`);
    const data = await res.json();
    if (data.ok) setTasks(data.data || []);
  };

  const fetchAiReviewStatus = async () => {
    try {
      const res = await fetch(`/api/admin/settings?wallet=${address}`);
      const data = await res.json();
      if (data.ok) setAiReviewEnabled(data.ai_review_enabled);
    } catch {
      // ignore
    }
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

  const toggleAiReview = async () => {
    const newValue = !aiReviewEnabled;
    setAiReviewEnabled(newValue);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_wallet: address,
          key: 'ai_review_enabled',
          value: String(newValue),
        }),
      });
      const data = await res.json();
      if (!data.ok) setAiReviewEnabled(!newValue); // revert on failure
    } catch {
      setAiReviewEnabled(!newValue); // revert on failure
    }
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

  // Tasks CRUD
  const openNewTask = () => {
    setEditingTask(null);
    setTaskForm({ ...EMPTY_TASK_FORM });
    setMetadataKey('');
    setMetadataValue('');
    setShowTaskForm(true);
  };

  const openEditTask = (task: AdminTask) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description,
      category: task.category,
      verification_type: task.verification_type,
      points: task.points,
      cap: task.cap,
      frequency: task.frequency,
      metadata: task.metadata || {},
      status: task.status,
    });
    setMetadataKey('');
    setMetadataValue('');
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskForm({ ...EMPTY_TASK_FORM });
  };

  const addMetadata = () => {
    if (!metadataKey.trim()) return;
    setTaskForm(f => ({
      ...f,
      metadata: { ...f.metadata, [metadataKey.trim()]: metadataValue },
    }));
    setMetadataKey('');
    setMetadataValue('');
  };

  const removeMetadata = (key: string) => {
    setTaskForm(f => {
      const next = { ...f.metadata };
      delete next[key];
      return { ...f, metadata: next };
    });
  };

  const saveTask = async () => {
    if (!taskForm.name.trim()) {
      alert('Task name is required');
      return;
    }
    setTaskSaving(true);
    try {
      if (editingTask) {
        const res = await fetch('/api/admin/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_wallet: address,
            task_id: editingTask.id,
            ...taskForm,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          fetchTasks();
          closeTaskForm();
        } else {
          alert(data.error || 'Failed to update task');
        }
      } else {
        const res = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_wallet: address,
            ...taskForm,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          fetchTasks();
          closeTaskForm();
        } else {
          alert(data.error || 'Failed to create task');
        }
      }
    } finally {
      setTaskSaving(false);
    }
  };

  const deleteTask = async (taskId: string, taskName: string) => {
    if (!confirm(`Delete task "${taskName}"? If it has submissions, it will be deactivated instead.`)) return;
    const res = await fetch(`/api/admin/tasks?wallet=${address}&task_id=${taskId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.ok) {
      fetchTasks();
    } else {
      alert(data.error || 'Failed to delete');
    }
  };

  const filteredUsers = searchWallet
    ? users.filter((u) => u.wallet_address.toLowerCase().includes(searchWallet.toLowerCase()))
    : users;

  const filteredTasks = taskFilter === 'all'
    ? tasks
    : tasks.filter(t => t.category === taskFilter);

  const taskCategories = [...new Set(tasks.map(t => t.category))];

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
    { id: 'tasks', label: 'Tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="glass-card p-8 rounded-2xl hover-lift">
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

                <div className="glass-card p-8 rounded-2xl hover-lift">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-lg text-[#b6bbff]/80">AI Review</span>
                    <div className="flex items-center gap-3">
                      <div className={`relative w-4 h-4 rounded-full ${aiReviewEnabled ? 'bg-[#b9f0d7]' : 'bg-[#7d85d0]/40'}`}>
                        {aiReviewEnabled && <div className="absolute inset-0 rounded-full bg-[#b9f0d7] animate-ping opacity-50" />}
                      </div>
                      <span className={`font-bold text-lg ${aiReviewEnabled ? 'text-[#b9f0d7]' : 'text-[#7d85d0]'}`}>
                        {aiReviewEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleAiReview}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      aiReviewEnabled
                        ? 'bg-[#ff5252]/20 text-[#ff5252] border border-[#ff5252]/30 hover:bg-[#ff5252]/30 hover:shadow-[0_0_20px_rgba(255,82,82,0.3)]'
                        : 'bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] text-white hover:shadow-[0_0_30px_rgba(185,240,215,0.4)] hover:scale-[1.02]'
                    }`}
                  >
                    {aiReviewEnabled ? 'Disable AI Review' : 'Enable AI Review'}
                  </button>
                  <p className="text-xs text-[#b6bbff]/40 mt-3 text-center">
                    When enabled, submissions are auto-verified by AI
                  </p>
                </div>
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
                    onClick={toggleAiReview}
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
                    <p className="font-medium">AI Review Active</p>
                    <p className="text-sm text-[#b6bbff]/60">New submissions are automatically verified by AI</p>
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
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Actions</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
                  Task Management
                </h2>
                <button
                  onClick={openNewTask}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-[1.02] transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Task
                </button>
              </div>

              {/* Category filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    taskFilter === 'all'
                      ? 'bg-[#6265fe] text-white'
                      : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20'
                  }`}
                >
                  All ({tasks.length})
                </button>
                {taskCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTaskFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      taskFilter === cat
                        ? 'bg-[#6265fe] text-white'
                        : 'bg-[#7d85d0]/10 text-[#7d85d0] hover:bg-[#7d85d0]/20'
                    }`}
                  >
                    {cat} ({tasks.filter(t => t.category === cat).length})
                  </button>
                ))}
              </div>

              {/* Tasks table */}
              <div className="glass-card overflow-hidden rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#6265fe]/20 to-[#7d85d0]/10">
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Task</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Category</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Type</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Points</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Cap</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Status</th>
                      <th className="text-left py-4 px-5 text-[#b6bbff]/80 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className="border-t border-[#7d85d0]/10 hover:bg-[#6265fe]/10 transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="py-4 px-5">
                          <div>
                            <div className="text-white font-medium text-sm">{task.name}</div>
                            <div className="text-[#7d85d0] text-xs mt-0.5 max-w-xs truncate">{task.description}</div>
                            {task.metadata && Object.keys(task.metadata).length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {Object.entries(task.metadata).map(([k, v]) => v && (
                                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffc107]/10 text-[#ffc107]">
                                    {k}: {String(v).length > 20 ? String(v).slice(0, 20) + '...' : v}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-3 py-1 rounded-lg bg-[#6265fe]/10 text-white text-xs font-medium capitalize">
                            {task.category}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[#c9e8ff] text-xs">{task.verification_type}</span>
                          <div className="text-[#7d85d0] text-[10px]">{task.frequency}</div>
                        </td>
                        <td className="py-4 px-5 text-[#b9f0d7] font-bold text-sm">{task.points}</td>
                        <td className="py-4 px-5 text-[#c9e8ff] text-sm">{task.cap}</td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs border font-medium ${
                              task.status === 'active'
                                ? 'bg-[#b9f0d7]/15 text-[#b9f0d7] border-[#b9f0d7]/30'
                                : task.status === 'coming_soon'
                                ? 'bg-[#ffc107]/15 text-[#ffc107] border-[#ffc107]/30'
                                : 'bg-[#ff5252]/15 text-[#ff5252] border-[#ff5252]/30'
                            }`}
                          >
                            {task.status === 'coming_soon' ? 'Coming Soon' : task.status}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditTask(task)}
                              className="px-3 py-1.5 bg-[#6265fe]/10 text-[#6265fe] border border-[#6265fe]/30 rounded-lg text-xs font-medium hover:bg-[#6265fe]/20 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task.id, task.name)}
                              className="px-3 py-1.5 bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/30 rounded-lg text-xs font-medium hover:bg-[#ff5252]/20 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#7d85d0]">
                          No tasks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Task form modal */}
              {showTaskForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeTaskForm} />
                  <div className="relative glass-card w-full max-w-xl max-h-[85vh] overflow-hidden rounded-2xl">
                    {/* Form header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#7d85d0]/10">
                      <h3 className="text-xl font-bold text-white">
                        {editingTask ? 'Edit Task' : 'New Task'}
                      </h3>
                      <button
                        onClick={closeTaskForm}
                        className="w-10 h-10 rounded-xl bg-[#7d85d0]/10 hover:bg-[#7d85d0]/20 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#b6bbff]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Form body */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)] space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Task Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Follow Orvex on X"
                          value={taskForm.name}
                          onChange={(e) => setTaskForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all placeholder:text-[#7d85d0]/40 text-sm"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Description</label>
                        <textarea
                          placeholder="Brief description of the task"
                          value={taskForm.description}
                          onChange={(e) => setTaskForm(f => ({ ...f, description: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all placeholder:text-[#7d85d0]/40 text-sm resize-none"
                        />
                      </div>

                      {/* Row: Category + Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Category</label>
                          <select
                            value={taskForm.category}
                            onChange={(e) => setTaskForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          >
                            <option value="social">Social</option>
                            <option value="advanced">Advanced</option>
                            <option value="consistency">Consistency</option>
                            <option value="trading">Trading</option>
                            <option value="liquidity">Liquidity</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Status</label>
                          <select
                            value={taskForm.status}
                            onChange={(e) => setTaskForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="coming_soon">Coming Soon</option>
                            <option value="locked">Locked</option>
                          </select>
                        </div>
                      </div>

                      {/* Row: Verification + Points */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Verification Type</label>
                          <select
                            value={taskForm.verification_type}
                            onChange={(e) => setTaskForm(f => ({ ...f, verification_type: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          >
                            <option value="screenshot">Screenshot</option>
                            <option value="link">Link</option>
                            <option value="manual">Manual</option>
                            <option value="auto">Auto</option>
                            <option value="onchain">On-chain</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">CP Reward</label>
                          <input
                            type="number"
                            value={taskForm.points}
                            onChange={(e) => setTaskForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Row: Cap + Frequency */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Max Completions</label>
                          <input
                            type="number"
                            min={1}
                            value={taskForm.cap}
                            onChange={(e) => setTaskForm(f => ({ ...f, cap: parseInt(e.target.value) || 1 }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">Frequency</label>
                          <select
                            value={taskForm.frequency}
                            onChange={(e) => setTaskForm(f => ({ ...f, frequency: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all text-sm"
                          >
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="unlimited">Unlimited</option>
                          </select>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div>
                        <label className="block text-sm text-[#b6bbff]/80 font-medium mb-2">
                          Metadata
                          <span className="text-[#7d85d0] font-normal ml-2">
                            (e.g. target_account, tweet_url)
                          </span>
                        </label>

                        {/* Existing metadata entries */}
                        {Object.entries(taskForm.metadata).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-2 bg-[#6265fe]/10 border border-[#6265fe]/20 rounded-lg text-xs text-[#c9e8ff] font-mono min-w-[100px]">
                              {k}
                            </span>
                            <input
                              type="text"
                              value={v}
                              onChange={(e) => setTaskForm(f => ({
                                ...f,
                                metadata: { ...f.metadata, [k]: e.target.value },
                              }))}
                              className="flex-1 px-3 py-2 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-lg text-xs focus:outline-none focus:border-[#6265fe] transition-all"
                            />
                            <button
                              onClick={() => removeMetadata(k)}
                              className="px-2 py-2 bg-[#ff5252]/10 text-[#ff5252] rounded-lg hover:bg-[#ff5252]/20 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Add new metadata */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="key"
                            value={metadataKey}
                            onChange={(e) => setMetadataKey(e.target.value)}
                            className="w-[120px] px-3 py-2 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-lg text-xs focus:outline-none focus:border-[#6265fe] transition-all placeholder:text-[#7d85d0]/40 font-mono"
                          />
                          <input
                            type="text"
                            placeholder="value"
                            value={metadataValue}
                            onChange={(e) => setMetadataValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addMetadata()}
                            className="flex-1 px-3 py-2 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-lg text-xs focus:outline-none focus:border-[#6265fe] transition-all placeholder:text-[#7d85d0]/40"
                          />
                          <button
                            onClick={addMetadata}
                            disabled={!metadataKey.trim()}
                            className="px-3 py-2 bg-[#6265fe]/20 text-[#6265fe] rounded-lg hover:bg-[#6265fe]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Quick-add buttons for common metadata */}
                        {taskForm.verification_type === 'screenshot' && !taskForm.metadata.target_account && (
                          <button
                            onClick={() => {
                              setTaskForm(f => ({
                                ...f,
                                metadata: { ...f.metadata, target_account: '@' },
                              }));
                            }}
                            className="mt-2 text-xs text-[#6265fe] hover:text-[#b6bbff] transition-colors"
                          >
                            + Add target_account
                          </button>
                        )}
                        {taskForm.verification_type === 'link' && !taskForm.metadata.tweet_url && (
                          <button
                            onClick={() => {
                              setTaskForm(f => ({
                                ...f,
                                metadata: { ...f.metadata, tweet_url: '' },
                              }));
                            }}
                            className="mt-2 text-xs text-[#6265fe] hover:text-[#b6bbff] transition-colors"
                          >
                            + Add tweet_url
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form footer */}
                    <div className="p-6 border-t border-[#7d85d0]/10 flex gap-3">
                      <button
                        onClick={closeTaskForm}
                        className="flex-1 py-3.5 bg-[#7d85d0]/10 text-[#b6bbff] font-semibold rounded-xl hover:bg-[#7d85d0]/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveTask}
                        disabled={taskSaving || !taskForm.name.trim()}
                        className="flex-1 py-3.5 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {taskSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </span>
                        ) : editingTask ? 'Update Task' : 'Create Task'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
