'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

export function StatsCard() {
    return (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000] h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl uppercase">Your Vibe Stats</h3>
                <TrendingUp className="w-6 h-6" />
            </div>

            <div className="flex gap-4 items-end h-32 mb-4">
                {/* Mock Chart Bars */}
                <div className="flex-1 bg-black/10 rounded-t-lg h-[40%] relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        40%
                    </div>
                </div>
                <div className="flex-1 bg-[#FACC55] rounded-t-lg h-[80%] border-t-[2px] border-x-[2px] border-black relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Happy
                    </div>
                </div>
                <div className="flex-1 bg-black/10 rounded-t-lg h-[30%] relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        30%
                    </div>
                </div>
                <div className="flex-1 bg-black/10 rounded-t-lg h-[50%] relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        50%
                    </div>
                </div>
            </div>

            <p className="font-bold text-sm text-black/60 text-center">
                You've been mostly <span className="text-black">Happy</span> this week!
            </p>
        </div>
    );
}
