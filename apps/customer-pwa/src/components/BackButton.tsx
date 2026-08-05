'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md text-stone-700 press-effect hover:bg-white transition"
    >
      <ArrowLeft size={18} />
    </button>
  );
}
