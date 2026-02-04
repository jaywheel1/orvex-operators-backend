'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
}

function SubmitForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('task');
  const { address, isConnected } = useAccount();
  const [task, setTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTask();
    } else {
      setLoading(false);
      setError('No task specified');
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`);
      const data = await res.json();
      if (data.ok) {
        setTask(data.data);
      } else {
        setError('Task not found');
      }
    } catch {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofUrl && !screenshot) {
      setError('Please provide a proof URL or screenshot');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('wallet_address', address || '');
      formData.append('task_id', id || '');
      if (proofUrl) formData.append('proof_url', proofUrl);
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await fetch('/api/submit-task', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit task');
      }
    } catch {
      setError('Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="relative flex flex-col items-center justify-center px-8 py-32">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#b9f0d7]/20 border border-[#7d85d0]/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
          Connect Wallet to Continue
        </h1>
        <p className="text-[#b6bbff]/60 mb-8">Connect your wallet to submit this task</p>
        <ConnectButton />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center px-8 py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#6265fe] border-t-transparent animate-spin" />
          <span className="text-[#b6bbff]/60">Loading...</span>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="relative max-w-xl mx-auto px-8 py-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] rounded-full opacity-30 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] bg-clip-text text-transparent mb-4">
          Task Submitted!
        </h1>
        <p className="text-[#b6bbff]/60 mb-8">
          Your submission is pending review. You&apos;ll receive points once approved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="relative max-w-xl mx-auto px-8 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff5252]/20 to-transparent border border-[#ff5252]/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#ff5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
          Task Not Found
        </h1>
        <p className="text-[#b6bbff]/60 mb-8">{error || 'This task does not exist.'}</p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="relative max-w-xl mx-auto px-8 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#b6bbff]/60 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Task Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6265fe]/10 to-transparent border border-[#7d85d0]/20 mb-8">
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#6265fe]/20 text-[#b6bbff] uppercase tracking-wide mb-4">
          {task.category}
        </span>
        <h1 className="text-2xl font-bold text-white mb-3">{task.name}</h1>
        <p className="text-[#b6bbff]/60 mb-4">{task.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#b9f0d7]">+{task.points}</span>
          <span className="text-[#7d85d0]">points on approval</span>
        </div>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
          Submit Proof
        </h2>

        <div className="space-y-2">
          <label className="block text-sm text-[#b6bbff]/60">
            Proof URL (tweet link, post URL, etc.)
          </label>
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://x.com/yourusername/status/..."
            className="w-full px-4 py-3.5 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#7d85d0]/20" />
          <span className="text-[#7d85d0]/40 text-sm">or</span>
          <div className="flex-1 h-px bg-[#7d85d0]/20" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#b6bbff]/60">
            Upload Screenshot
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full px-4 py-3.5 bg-[#070713] border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6265fe]/20 file:text-[#b6bbff] file:font-medium file:cursor-pointer hover:file:bg-[#6265fe]/30"
            />
          </div>
          {screenshot && (
            <p className="text-sm text-[#b9f0d7]">{screenshot.name}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(98,101,254,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Task'
          )}
        </button>
      </form>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#070713] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#6265fe] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#b9f0d7] rounded-full opacity-10 blur-[100px]" />
      </div>

      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-[#7d85d0]/20">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Orvex" width={40} height={40} className="rounded-full" />
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
            Orvex
          </span>
        </Link>
        <ConnectButton />
      </nav>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#6265fe] border-t-transparent animate-spin" />
              <span className="text-[#b6bbff]/60">Loading...</span>
            </div>
          </div>
        }
      >
        <SubmitForm />
      </Suspense>
    </div>
  );
}
