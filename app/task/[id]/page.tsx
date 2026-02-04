'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
}

export default function TaskSubmissionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [task, setTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
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
      formData.append('task_id', id as string);
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

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <Link href="/" className="text-2xl font-bold">ORVEX</Link>
          <ConnectButton />
        </nav>
        <main className="max-w-xl mx-auto px-8 py-16 text-center">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-3xl font-bold mb-4">Task Submitted!</h1>
          <p className="text-zinc-400 mb-8">
            Your submission is pending review. You&apos;ll receive points once approved.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <Link href="/" className="text-2xl font-bold">ORVEX</Link>
          <ConnectButton />
        </nav>
        <main className="max-w-xl mx-auto px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Task Not Found</h1>
          <p className="text-zinc-400 mb-8">{error || 'This task does not exist.'}</p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="text-2xl font-bold">ORVEX</Link>
        <ConnectButton />
      </nav>

      <main className="max-w-xl mx-auto px-8 py-12">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition mb-8 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 mb-8">
          <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 uppercase">
            {task.category}
          </span>
          <h1 className="text-2xl font-bold mt-3 mb-2">{task.name}</h1>
          <p className="text-zinc-400 mb-4">{task.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-green-500 font-bold text-xl">+{task.points}</span>
            <span className="text-zinc-500">points on approval</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold">Submit Proof</h2>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">
              Proof URL (tweet link, post URL, etc.)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://x.com/yourusername/status/..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="text-center text-zinc-500">or</div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">
              Upload Screenshot
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-800 file:text-white"
            />
            {screenshot && (
              <p className="text-sm text-zinc-500">{screenshot.name}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Task'}
          </button>
        </form>
      </main>
    </div>
  );
}
