'use client';

import { useState } from 'react';

export interface TaskData {
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
  user_status: string;
  completions: number;
  pending_count: number;
}

interface TaskModalProps {
  task: TaskData;
  walletAddress: string;
  referralStats?: {
    referral_code: string;
    referral_link: string;
    verified_referrals: number;
    remaining_slots: number;
    max_referrals: number;
    cp_per_referral: number;
    total_cp_earned: number;
  } | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function TaskModal({ task, walletAddress, referralStats, onClose, onSubmitted }: TaskModalProps) {
  const [proofUrl, setProofUrl] = useState('');
  const [proofText, setProofText] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const isReferralTask = task.task_key === 'refer-friend';
  const isAutoTask = task.verification_type === 'auto' && !isReferralTask;
  const isScreenshotTask = task.verification_type === 'screenshot';
  const isLinkTask = task.verification_type === 'link';
  const isManualTask = task.verification_type === 'manual';
  const isCompleted = task.user_status === 'completed';
  const isPending = task.user_status === 'pending';
  const remainingCompletions = task.cap - task.completions;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (isScreenshotTask && !screenshot) {
      setError('Please upload a screenshot');
      return;
    }
    if (isLinkTask && !proofUrl) {
      setError('Please enter a proof URL');
      return;
    }
    if (isManualTask && !proofUrl && !proofText && !screenshot) {
      setError('Please provide proof (URL, description, or screenshot)');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('wallet_address', walletAddress);
      formData.append('task_id', task.id);
      if (proofUrl) formData.append('proof_url', proofUrl);
      if (proofText) formData.append('proof_text', proofText);
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await fetch('/api/submit-task', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(data.message || 'Submission received!');
        setProofUrl('');
        setProofText('');
        setScreenshot(null);
        onSubmitted();
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralLink = async () => {
    if (referralStats?.referral_link) {
      await navigator.clipboard.writeText(referralStats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#7d85d0]/10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">{task.name}</h2>
              <span className="text-sm font-bold text-[#b9f0d7]">+{task.points} CP</span>
            </div>
            <p className="text-sm text-[#b6bbff]/50">{task.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#7d85d0]/10 hover:bg-[#7d85d0]/20 flex items-center justify-center transition-colors ml-3 flex-shrink-0"
          >
            <svg className="w-5 h-5 text-[#b6bbff]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
          {/* Status badges */}
          <div className="flex items-center gap-2 mb-5">
            {task.cap > 1 && (
              <span className="text-xs px-2 py-1 rounded-full bg-[#6265fe]/10 text-[#6265fe]">
                {task.completions}/{task.cap} completed
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-[#7d85d0]/10 text-[#7d85d0]">
              {task.frequency === 'once' ? 'One-time' : task.frequency === 'weekly' ? 'Weekly' : task.frequency === 'daily' ? 'Daily' : 'Repeatable'}
            </span>
            {isPending && (
              <span className="text-xs px-2 py-1 rounded-full bg-[#ffc107]/10 text-[#ffc107]">
                Pending review
              </span>
            )}
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-[#b9f0d7]/10 text-[#b9f0d7]">
                Completed
              </span>
            )}
          </div>

          {/* Completed state */}
          {isCompleted && (
            <div className="p-5 rounded-xl bg-[#b9f0d7]/10 border border-[#b9f0d7]/20 text-center">
              <svg className="w-12 h-12 text-[#b9f0d7] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#b9f0d7] font-semibold">Task Completed!</p>
              <p className="text-[#b9f0d7]/60 text-sm mt-1">
                You earned {task.completions * task.points} CP from this task
              </p>
            </div>
          )}

          {/* Pending state */}
          {isPending && !isCompleted && (
            <div className="p-5 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20 text-center mb-5">
              <svg className="w-12 h-12 text-[#ffc107] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#ffc107] font-semibold">Submission Under Review</p>
              <p className="text-[#ffc107]/60 text-sm mt-1">Your submission is being reviewed</p>
            </div>
          )}

          {/* Referral Task */}
          {isReferralTask && !isCompleted && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0d0d1a]/80 border border-[#7d85d0]/20">
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Your Referral Code</label>
                <div className="text-2xl font-bold font-mono text-[#ffc107]">
                  {referralStats?.referral_code || '...'}
                </div>
              </div>

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Your Referral Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralStats?.referral_link || ''}
                    className="flex-1 px-3 py-2.5 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl text-sm text-[#c9e8ff] font-mono"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#ffc107] to-[#ffab00] text-[#070713] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all text-sm"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#ffc107]/10 border border-[#ffc107]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#ffc107]/80 text-sm">Referral Progress</span>
                  <span className="text-[#ffc107] font-bold">
                    {referralStats?.verified_referrals || 0} / {referralStats?.max_referrals || 5}
                  </span>
                </div>
                <div className="h-2 bg-[#0d0d1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffc107] to-[#ffab00] transition-all duration-500"
                    style={{ width: `${((referralStats?.verified_referrals || 0) / (referralStats?.max_referrals || 5)) * 100}%` }}
                  />
                </div>
                <p className="text-[#ffc107]/50 text-xs mt-2">
                  Earn {referralStats?.cp_per_referral || 200} CP for each friend who registers
                </p>
              </div>
            </div>
          )}

          {/* Auto Tasks (Early Adopter, Testnet OG) */}
          {isAutoTask && !isCompleted && (
            <div className="p-5 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/20 text-center">
              <svg className="w-12 h-12 text-[#6265fe] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-[#6265fe] font-semibold">Automatic Verification</p>
              <p className="text-[#b6bbff]/50 text-sm mt-1">
                This task is verified automatically when you meet the criteria
              </p>
            </div>
          )}

          {/* Screenshot Task Form */}
          {isScreenshotTask && !isCompleted && !isPending && (
            <div className="space-y-4">
              {task.metadata?.target_account && (
                <div className="p-4 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/20">
                  <p className="text-sm text-[#c9e8ff]">
                    <span className="text-[#6265fe] font-medium">Instructions:</span>{' '}
                    {task.description}
                    {task.metadata.target_account && (
                      <span className="text-[#b9f0d7] font-semibold"> {task.metadata.target_account}</span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Upload Screenshot</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#7d85d0]/30 rounded-xl cursor-pointer hover:border-[#6265fe]/50 transition-colors bg-[#0d0d1a]/50">
                  {screenshot ? (
                    <div className="flex items-center gap-2 text-[#b9f0d7]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">{screenshot.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#7d85d0]">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-sm">Click to upload screenshot</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Link Task Form */}
          {isLinkTask && !isCompleted && !isPending && (
            <div className="space-y-4">
              {task.metadata?.tweet_url && (
                <div className="p-4 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/20">
                  <p className="text-sm text-[#c9e8ff] mb-3">
                    <span className="text-[#6265fe] font-medium">Instructions:</span>{' '}
                    {task.description}
                  </p>
                  <a
                    href={task.metadata.tweet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6265fe]/20 text-[#6265fe] rounded-lg text-sm font-medium hover:bg-[#6265fe]/30 transition-colors"
                  >
                    Open Tweet
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">
                  Your {task.task_key?.includes('retweet') ? 'Retweet' : task.task_key?.includes('quote') ? 'Quote Tweet' : 'Proof'} URL
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl text-sm text-white placeholder:text-[#7d85d0]/40 focus:outline-none focus:border-[#6265fe] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Manual Task Form */}
          {isManualTask && !isCompleted && !isPending && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#6265fe]/10 border border-[#6265fe]/20">
                <p className="text-sm text-[#c9e8ff]">
                  <span className="text-[#6265fe] font-medium">Instructions:</span>{' '}
                  {task.description}. Submit your proof below for operator review.
                </p>
              </div>

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Proof URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl text-sm text-white placeholder:text-[#7d85d0]/40 focus:outline-none focus:border-[#6265fe] transition-colors"
                />
              </div>

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Description / Notes</label>
                <textarea
                  placeholder="Describe what you did..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 rounded-xl text-sm text-white placeholder:text-[#7d85d0]/40 focus:outline-none focus:border-[#6265fe] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-[#b6bbff]/50 text-xs mb-2 block">Screenshot (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#7d85d0]/30 rounded-xl cursor-pointer hover:border-[#6265fe]/50 transition-colors bg-[#0d0d1a]/50">
                  {screenshot ? (
                    <div className="flex items-center gap-2 text-[#b9f0d7]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{screenshot.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#7d85d0]">Click to upload</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#ff5252]/10 border border-[#ff5252]/20 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#ff5252] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-[#ff5252]">{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-4 p-3 rounded-xl bg-[#b9f0d7]/10 border border-[#b9f0d7]/20 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#b9f0d7] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#b9f0d7]">{success}</span>
            </div>
          )}
        </div>

        {/* Footer with submit */}
        {!isCompleted && !isReferralTask && !isAutoTask && !isPending && (
          <div className="p-6 border-t border-[#7d85d0]/10">
            {remainingCompletions > 0 && task.cap > 1 && (
              <p className="text-xs text-[#7d85d0] mb-3 text-center">
                {remainingCompletions} submission{remainingCompletions !== 1 ? 's' : ''} remaining
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(98,101,254,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                `Submit for Review`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
