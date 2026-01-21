'use client';

import { History, Play } from 'lucide-react';

const MOCK_HISTORY = [
    { id: 1, mood: 'Happy', track: 'Good 4 U', artist: 'Olivia Rodrigo', color: 'bg-[#FACC55]' },
    { id: 2, mood: 'Calm', track: 'Lo-fi Beats', artist: 'Chill Cow', color: 'bg-[#A78BFA]' },
    { id: 3, mood: 'Energetic', track: 'Levitating', artist: 'Dua Lipa', color: 'bg-[#FB58B4]' },
    { id: 4, mood: 'Sad', track: 'Drivers License', artist: 'Olivia Rodrigo', color: 'bg-[#3DD598]' },
];

export function HistoryList() {
    return (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000] h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl uppercase">Recent Vibes</h3>
                <History className="w-6 h-6" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
                {MOCK_HISTORY.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border-[2px] border-black rounded-xl hover:bg-black/5 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${item.color} border-[2px] border-black rounded-full flex items-center justify-center`}>
                                <Play className="w-4 h-4 fill-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight">{item.track}</h4>
                                <p className="text-xs font-bold text-black/50">{item.artist}</p>
                            </div>
                        </div>
                        <span className="text-xs font-black uppercase bg-black text-white px-2 py-1 rounded">
                            {item.mood}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
