'use client';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'text' | 'avatar';
  height?: string;
  width?: string;
}

export default function SkeletonLoader({
  count = 1,
  type = 'card',
  height = 'h-24',
  width = 'w-full',
}: SkeletonLoaderProps) {
  const getSkeletonContent = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`${width} ${height} bg-[#0d0d1a]/50 border border-[#7d85d0]/10 rounded-xl p-4 animate-pulse`}>
            <div className="space-y-3">
              <div className="h-4 bg-[#7d85d0]/20 rounded w-3/4"></div>
              <div className="h-3 bg-[#7d85d0]/10 rounded w-1/2"></div>
              <div className="h-2 bg-[#7d85d0]/10 rounded w-full"></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <div className={`${width} h-3 bg-[#7d85d0]/20 rounded animate-pulse`}></div>
            <div className={`${width} h-3 bg-[#7d85d0]/10 rounded animate-pulse`}></div>
          </div>
        );
      case 'avatar':
        return (
          <div className={`${width} ${height} bg-[#7d85d0]/20 rounded-full animate-pulse`}></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{getSkeletonContent()}</div>
      ))}
    </div>
  );
}
