'use client';

import { Play, TrendingUp } from 'lucide-react';

const TRENDING_PLAYLISTS = [
    { id: 1, title: 'Monday Motivation', mood: 'Energy', color: 'bg-[#FACC55]', icon: '⚡' },
    { id: 2, title: 'Late Night Lo-Fi', mood: 'Chill', color: 'bg-[#A78BFA]', icon: '🌙' },
    { id: 3, title: 'Workout Pump', mood: 'Power', color: 'bg-[#FB58B4]', icon: '💪' },
    { id: 4, title: 'Rainy Day Jazz', mood: 'Calm', color: 'bg-[#3DD598]', icon: '☔' },
];

export function TrendingSection() {
    return (
        <div className="w-full mt-16 max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
                <TrendingUp className="w-8 h-8" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">Trending Vibes</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {TRENDING_PLAYLISTS.map((item) => (
                    <div key={item.id} className="group cursor-pointer flex flex-col gap-3">
                        {/* Artwork */}
                        <div className={`aspect-square w-full ${item.color} border-[3px] border-black rounded-3xl shadow-[6px_6px_0px_0px_#000] group-hover:shadow-[8px_8px_0px_0px_#000] group-hover:translate-y-[-4px] transition-all flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-4xl md:text-5xl">{item.icon}</span>

                            <div className="absolute bottom-3 right-3 w-10 h-10 bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="text-center">
                            <h3 className="font-black text-lg leading-tight uppercase group-hover:text-[#FB58B4] transition-colors">{item.title}</h3>
                            <p className="text-xs font-bold text-black/50 mt-1 uppercase tracking-wide">{item.mood}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
