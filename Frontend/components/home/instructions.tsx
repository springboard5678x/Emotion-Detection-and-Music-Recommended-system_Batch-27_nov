'use client';

import { Camera, Music, Sparkles, ArrowRight } from 'lucide-react';

export function Instructions() {
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center my-8 md:my-12 w-full max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-3 flex-1 group">
                <div className="bg-[#FACC55] w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-2 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-black" />
                </div>
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tight">1. Scan Face</h3>
                    <p className="font-bold text-black/60 text-sm mt-1">Allow camera access</p>
                </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-black/20" />

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-3 flex-1 group">
                <div className="bg-[#FB58B4] w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-2 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-black" />
                </div>
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tight">2. Get Analysis</h3>
                    <p className="font-bold text-black/60 text-sm mt-1">AI detects your vibe</p>
                </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-black/20" />

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-3 flex-1 group">
                <div className="bg-[#3DD598] w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-2 transition-transform duration-300">
                    <Music className="w-8 h-8 text-black" />
                </div>
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tight">3. Vibe Out</h3>
                    <p className="font-bold text-black/60 text-sm mt-1">Curated tunes for you</p>
                </div>
            </div>
        </div>
    );
}
