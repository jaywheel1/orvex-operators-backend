'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

  const fetchTask = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTask();
    } else {
      setLoading(false);
      setError('No task specified');
    }
  }, [id, fetchTask]);

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
        <div className="glass-card p-12 rounded-3xl text-center max-w-md mx-4 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6265fe]/20 to-[#b9f0d7]/20 border border-[#7d85d0]/30 flex items-center justify-center mb-6 mx-auto animate-float">
            <svg className="w-12 h-12 text-[#7d85d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Connect Wallet to Continue
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">Connect to submit proof of completion.</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center px-8 py-32">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-[#b9f0d7]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <span className="text-[#b6bbff]/60 animate-pulse">Loading task...</span>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="relative max-w-xl mx-auto px-8 py-16 text-center">
        <div className="glass-card p-12 rounded-3xl animate-fade-in-up">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-6 bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] rounded-full opacity-30 blur-2xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#b9f0d7] to-[#6265fe] flex items-center justify-center shadow-[0_0_40px_rgba(185,240,215,0.4)]">
              <svg className="w-14 h-14 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b9f0d7] to-[#6265fe] bg-clip-text text-transparent mb-4">
            Submission Received
          </h1>
          <p className="text-[#b6bbff]/60 mb-8 text-lg">
            Under review. Command Points awarded on verification.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-[1.02] transition-all duration-300"
          >
            Return to Console
          </Link>
        </div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="relative max-w-xl mx-auto px-8 py-16 text-center">
        <div className="glass-card p-12 rounded-3xl animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff5252]/20 to-transparent border border-[#ff5252]/30 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-12 h-12 text-[#ff5252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent mb-4">
            Operation Not Found
          </h1>
          <p className="text-[#b6bbff]/60 mb-8">{error || 'This operation does not exist or has been deactivated.'}</p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-[1.02] transition-all duration-300"
          >
            Return to Console
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative max-w-xl mx-auto px-8 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#b6bbff]/60 hover:text-white transition-colors mb-8 group animate-fade-in-up"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Console
      </Link>

      {/* Task Card */}
      <div className="glass-card p-8 rounded-2xl mb-8 animate-fade-in-up hover-lift" style={{ animationDelay: '0.1s' }}>
        <span className="inline-block text-xs px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6265fe]/30 to-[#7d85d0]/20 text-[#b6bbff] uppercase tracking-wide mb-4 border border-[#6265fe]/30 font-semibold">
          {task.category}
        </span>
        <h1 className="text-2xl font-bold text-white mb-3">{task.name}</h1>
        <p className="text-[#b6bbff]/60 mb-6">{task.description}</p>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#b9f0d7]/10 to-transparent border border-[#b9f0d7]/20">
          <div className="w-10 h-10 rounded-lg bg-[#b9f0d7]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#b9f0d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#b9f0d7]">+{task.points}</span>
            <span className="text-[#7d85d0] ml-2">CP on approval</span>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
          Submit Proof
        </h2>

        <div className="space-y-3">
          <label className="block text-sm text-[#b6bbff]/80 font-medium">
            Proof URL (tweet link, post URL, etc.)
          </label>
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://x.com/yourusername/status/..."
            className="w-full px-4 py-4 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] focus:shadow-[0_0_0_3px_rgba(98,101,254,0.2)] transition-all placeholder:text-[#7d85d0]/40"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#7d85d0]/30 to-transparent" />
          <span className="text-[#7d85d0]/60 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#7d85d0]/30 to-transparent" />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-[#b6bbff]/80 font-medium">
            Upload Screenshot
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full px-4 py-4 bg-[#070713]/50 border border-[#7d85d0]/30 rounded-xl focus:outline-none focus:border-[#6265fe] transition-all file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#6265fe]/30 file:to-[#7d85d0]/20 file:text-[#b6bbff] file:font-semibold file:cursor-pointer hover:file:from-[#6265fe]/40 hover:file:to-[#7d85d0]/30 file:transition-all"
            />
          </div>
          {screenshot && (
            <div className="flex items-center gap-2 text-sm text-[#b9f0d7]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {screenshot.name}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Submit for Review
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )}
        </button>
      </form>
    </main>
  );
}

function SubmitPageContent() {
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
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#b6bbff] bg-clip-text text-transparent">
            Orvex
          </span>
        </Link>
        <ConnectButton />
      </nav>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4 animate-fade-in-up">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#6265fe]/30 border-t-[#6265fe] animate-spin" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-[#b9f0d7]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <span className="text-[#b6bbff]/60 animate-pulse">Loading...</span>
            </div>
          </div>
        }
      >
        <SubmitForm />
      </Suspense>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <ErrorBoundary>
      <SubmitPageContent />
    </ErrorBoundary>
  );
}
