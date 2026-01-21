'use client';

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export function HomeButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/home')}
            className="group flex items-center gap-3 bg-black text-white hover:bg-gray-800 font-bold text-lg px-8 py-4 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] active:translate-y-0 active:shadow-none transition-all"
        >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Go to Home</span>
        </button>
    );
}
