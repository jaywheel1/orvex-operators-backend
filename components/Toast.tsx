'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ message, onClose }: ToastProps) {
  useEffect(() => {
    const duration = message.duration || 4000;
    const timer = setTimeout(() => onClose(message.id), duration);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColor = {
    success: 'bg-[#b9f0d7]/10 border-[#b9f0d7]/30',
    error: 'bg-[#ff5252]/10 border-[#ff5252]/30',
    info: 'bg-[#6265fe]/10 border-[#6265fe]/30',
    warning: 'bg-[#ffc107]/10 border-[#ffc107]/30',
  }[message.type];

  const iconColor = {
    success: 'text-[#b9f0d7]',
    error: 'text-[#ff5252]',
    info: 'text-[#6265fe]',
    warning: 'text-[#ffc107]',
  }[message.type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[message.type];

  return (
    <div className={`border rounded-lg p-4 ${bgColor} backdrop-blur-sm animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{message.title}</h3>
          {message.message && (
            <p className="text-sm text-[#b6bbff]/70 mt-1">{message.message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(message.id)}
          className="flex-shrink-0 text-[#b6bbff]/50 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ messages, onClose }: { messages: ToastMessage[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {messages.map(msg => (
        <div key={msg.id} className="pointer-events-auto">
          <ToastItem message={msg} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { id, type, title, message }]);
    return id;
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return { messages, addToast, removeToast };
}
