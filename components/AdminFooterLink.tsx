'use client';

import Link from 'next/link';

export default function AdminFooterLink() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center py-2 pointer-events-none">
      <Link
        href="/admin"
        className="pointer-events-auto text-[10px] text-white/[0.08] hover:text-white/30 transition-colors duration-500 select-none"
      >
        Admin
      </Link>
    </div>
  );
}
