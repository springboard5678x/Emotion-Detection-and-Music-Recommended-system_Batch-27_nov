'use client';

import React, { useRef, useState, useEffect } from 'react';
import { GreetingHeader } from '@/components/home/greeting-header';
import { Instructions } from '@/components/home/instructions';
import { WebcamView } from '@/components/custom/webcam-view';
import { analyzeMood } from '@/lib/api';
import { ApiResponse } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Music2, ExternalLink, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { Suspense } from 'react';

function HomeContent() {
    const webcamRef = useRef<{ capture: () => string | null; stop: () => void }>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [textInput, setTextInput] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const vibe = searchParams.get('vibe');
        if (vibe && !isAnalyzing) {
            setTextInput(vibe);
            handleVibeCheck(vibe);
            router.replace('/home', { scroll: false });
        }
    }, [searchParams]);

    const handleVibeCheck = async (overrideText?: string) => {
        setError(null);
        setIsAnalyzing(true);

        // Use override text if provided, otherwise fallback to state
        const textToProcess = typeof overrideText === 'string' ? overrideText : textInput;

        try {
            // Option 1: Text Analysis
            if (textToProcess.trim()) {
                const response = await fetch('/api/analyze-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textToProcess }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to analyze text');
                }

                const data = await response.json();
                setResult(data);
                toast.success('Vibe Check Verified!', {
                    description: `Detected: ${data.emotion}`,
                });
                setTextInput(''); // Clear input on success
                return;
            }

            // Option 2: Visual Analysis (Fallback)
            if (!webcamRef.current) return;
            const imageBase64 = webcamRef.current.capture();

            if (!imageBase64) {
                setError('Please describe your vibe or enable the camera for visual analysis.');
                return;
            }

            const data = await analyzeMood(imageBase64);
            setResult(data);
            toast.success('Visual Vibe Captured!', {
                description: `Detected: ${data.emotion}`,
            });
            webcamRef.current.stop(); // Stop camera on success

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to analyze mood');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSongClick = (song: ApiResponse['songs'][0]) => {
        const query = encodeURIComponent(`${song.track_name} ${song.artists}`);
        window.open(`https://open.spotify.com/search/${query}`, '_blank');
    };

    const showResults = isAnalyzing || result;

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-6 pt-10 pb-24 overflow-x-hidden">
            <div className="max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Top Section: Greeting & Spotify */}
                <div className="relative isolate grid md:grid-cols-2 gap-8 items-center min-h-[auto] md:min-h-[60vh] py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

                    {/* Floating Background Elements */}
                    <div className="absolute -top-12 -left-12 w-24 h-24 md:w-40 md:h-40 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                    <div className="absolute top-0 -right-4 w-24 h-24 md:w-40 md:h-40 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-24 h-24 md:w-40 md:h-40 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

                    {/* Left: Greeting & Content */}
                    <div className="relative z-10 flex flex-col justify-center items-start">
                        <GreetingHeader />

                        <div className="mt-6 md:mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                                Your emotions, <br />
                                <span className="bg-[#FACC55] px-2 text-black transform -skew-x-3 inline-block">amplified.</span>
                            </h2>
                            <p className="text-black/60 font-medium max-w-md text-sm md:text-base">
                                MoodMate translates your vibe into the perfect Spotify playlist. No searching, just feeling.
                            </p>

                            {/* Mini Stat Card */}
                            <div className="inline-flex items-center gap-3 bg-white border-2 border-black/5 rounded-full px-4 py-2 shadow-sm hover:scale-105 transition-transform cursor-default">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs md:text-sm font-bold text-black/70">System Status: Online & Listening</span>
                            </div>
                        </div>

                        {/* Floating Overlay Icons */}
                        <div className="absolute -top-12 -left-8 text-[#FACC55] animate-blob filter drop-shadow-lg z-20">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-12 scale-75 md:scale-100"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                    </div>

                    {/* Right: Spotify Trending */}
                    <div className="relative z-10 w-full hover:scale-[1.01] transition-transform duration-500 ease-out group mt-8 md:mt-0">
                        {/* Decorative shadow element behind spotify */}
                        <div className="absolute -inset-2 bg-black/5 rounded-[20px] -z-10 group-hover:bg-[#A78BFA]/20 transition-colors duration-500 blur-sm" />

                        {/* Floating Music Note Overlay */}
                        <div className="absolute -top-6 -right-6 z-20 text-[#FB58B4] animate-bounce duration-[3000ms] filter drop-shadow-md">
                            <Music2 className="w-8 h-8 md:w-12 md:h-12 transform rotate-12" />
                        </div>
                        {/* Floating Heart Overlay */}
                        <div className="absolute -bottom-6 -left-6 z-20 text-[#E34234] animate-blob animation-delay-2000 filter drop-shadow-md">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="md:w-10 md:h-10"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>

                        <iframe
                            data-testid="embed-iframe"
                            style={{ borderRadius: "12px" }}
                            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXbVhgADFy3im?utm_source=generator&theme=0"
                            width="90%"
                            height="352"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="shadow-[4px_4px_0px_0px_#a78bfa] md:shadow-[8px_8px_0px_0px_#a78bfa] bg-white relative z-10"
                        />
                    </div>
                </div>

                {/* Middle: Instructions */}
                <div className="w-full pt-8 border-t-[3px] border-black/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <Instructions />
                </div>

                {/* Input Section: Dynamic Layout (Scanner -> Results) */}
                <div className={`transition-all duration-500 ease-in-out w-full grid grid-cols-1 ${showResults ? 'md:grid-cols-2 md:grid-rows-[auto_1fr]' : ''} gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300`}>

                    {/* Left Side: Scanner & Verify Input (Row 1) */}
                    <div className={`flex flex-col items-center gap-8 w-full ${showResults ? 'md:col-start-1 md:row-start-1 h-fit' : 'max-w-2xl mx-auto'}`}>
                        {/* Camera Feed */}
                        <div className="w-full">
                            <WebcamView ref={webcamRef} />
                        </div>

                        {/* OR Separator + Text Input + Button */}
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
                            <span className="text-xl font-black uppercase shrink-0 text-black/60">OR</span>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Describe your current vibe..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleVibeCheck()}
                                    disabled={isAnalyzing}
                                    className="col-span-1 md:col-span-2 w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 md:px-6 md:py-4 font-medium text-base md:text-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all duration-300 ease-out hover:border-black placeholder:text-gray-400 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleVibeCheck()}
                                    disabled={isAnalyzing}
                                    className="col-span-1 w-full bg-[#FACC55] text-black rounded-xl px-4 py-3 md:px-4 md:py-4 font-bold text-base md:text-lg uppercase hover:bg-[#E3B645] transform transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                            <span className="inline">Analyzing</span>
                                        </>
                                    ) : (
                                        'Vibe Check'
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="w-full max-w-[90vw] md:max-w-full bg-red-100 border-[3px] border-black text-red-600 p-3 md:p-4 rounded-xl font-bold text-center text-sm md:text-base break-words animate-in fade-in slide-in-from-top-2 mx-auto">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Results (Spans Rows on Desktop) */}
                    {showResults && (
                        <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700 md:col-start-2 md:row-span-2 md:row-start-1">
                            {isAnalyzing ? (
                                <div className="bg-white border-[3px] border-black rounded-[32px] p-6 md:p-12 shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] flex flex-col items-center justify-center text-center min-h-[300px] md:min-h-[400px]">
                                    <div className="relative">
                                        <div className="w-16 h-16 md:w-24 md:h-24 border-[6px] border-black border-t-[#FB58B4] rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-lg md:text-2xl">🧠</div>
                                    </div>
                                    <h3 className="mt-8 text-2xl md:text-3xl font-black uppercase">Analyzing Vibe...</h3>
                                    <p className="text-black/60 font-bold mt-2 text-sm md:text-base">Connecting to "The Brain"</p>
                                </div>
                            ) : result ? (
                                <div className="flex flex-col gap-6">
                                    {/* Emotion Result Card */}
                                    <div className="bg-[#FB58B4] border-[3px] border-black rounded-[32px] p-6 md:p-8 shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] text-center relative overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                                        <div className="relative z-10">
                                            <p className="font-bold text-black/60 uppercase tracking-widest mb-2 text-xs md:text-base">Detected Mood</p>
                                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                {result.emotion}
                                            </h2>
                                            <div className="inline-block bg-black text-white px-4 py-1 rounded-full font-bold mt-4 text-sm">
                                                Confidence: {result.confidence}
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
                                    </div>

                                    {/* Song List */}
                                    <div className="bg-white border-[3px] border-black rounded-[32px] p-6 md:p-8 shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] relative group">
                                        {/* Header Area */}
                                        <div className="flex flex-col md:block mb-6">
                                            <h3 className="text-xl md:text-2xl font-black uppercase">
                                                Recommended Tracks
                                            </h3>
                                            <div className="mt-2 md:mt-0 md:absolute md:top-8 md:right-8 flex items-center md:flex-col md:items-end gap-2 md:gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-black uppercase tracking-wider leading-none">Powered by</span>
                                                <img src="/images/spotify.png" alt="Spotify" className="h-4 md:h-5 w-auto" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 md:gap-4">
                                            {result.songs.map((song, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSongClick(song)}
                                                    className="group cursor-pointer flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-black/5 rounded-xl transition-colors"
                                                >
                                                    {/* Art Placeholder */}
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-black/10 group-hover:border-black transition-colors">
                                                        <Music2 className="w-6 h-6 text-gray-400 group-hover:text-[#E34234] transition-colors" />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <p className="font-bold text-base truncate leading-tight group-hover:text-[#7c3aed] transition-colors">{song.track_name}</p>
                                                        <p className="text-sm font-medium text-black/50 truncate leading-tight">{song.artists}</p>
                                                    </div>

                                                    {/* Action */}
                                                    <ExternalLink className="w-5 h-5 text-black/30 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Info Section: Credits & Tips (Mobile: Last, Desktop: Col 1 Row 2) */}
                    {showResults && (
                        <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 md:col-start-1 md:row-start-2">
                            {/* AI Credits */}
                            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                                <h4 className="font-bold uppercase text-xs text-black/60 mb-4 tracking-wider">Powered By</h4>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <img src="https://www.vectorlogo.zone/logos/kaggle/kaggle-icon.svg" alt="Kaggle" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Visual Analysis</p>
                                            <p className="text-xs text-gray-500 font-medium">Custom Model (Kaggle Dataset)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <img src="https://ollama.com/public/ollama_holidays.png" alt="Ollama" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Text Analysis</p>
                                            <p className="text-xs text-gray-500 font-medium">GROK (Llama 3.3)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="px-2">
                                <h4 className="font-bold uppercase text-xs text-black/60 mb-4 tracking-wider pl-4">Pro Tips</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-black/80 font-medium bg-white p-3 rounded-lg border-2 border-black/5 hover:border-black/10 transition-colors">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC55] mt-1.5 shrink-0" />
                                        Ensure your face is well-lit for accurate emotion detection.
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-black/80 font-medium bg-white p-3 rounded-lg border-2 border-black/5 hover:border-black/10 transition-colors">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC55] mt-1.5 shrink-0" />
                                        Try describing your mood in detail for better song matches.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <HomeContent />
        </Suspense>
    );
}
