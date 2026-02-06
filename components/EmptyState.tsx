'use client';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'tasks' | 'search' | 'completed';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ title, description, icon = 'tasks', action }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'tasks':
        return (
          <svg className="w-16 h-16 text-[#7d85d0]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        );
      case 'search':
        return (
          <svg className="w-16 h-16 text-[#7d85d0]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-16 h-16 text-[#b9f0d7]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4">{getIcon()}</div>
      <h3 className="text-lg font-semibold text-[#b6bbff] mb-2">{title}</h3>
      <p className="text-sm text-[#7d85d0]/70 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white text-sm font-medium hover:shadow-[0_0_15px_rgba(98,101,254,0.3)] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
