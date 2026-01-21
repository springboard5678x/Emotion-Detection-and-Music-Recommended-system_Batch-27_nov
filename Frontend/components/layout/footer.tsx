'use client';

import Link from 'next/link';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { type User } from '@supabase/supabase-js';

export function Footer() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) return null;

    // Logged Out State: Simple Footer (Existing)
    if (!user) {
        return (
            <footer className="w-full bg-white px-4 py-8 mt-auto border-t border-black/5">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <Link href="/" className="flex items-center gap-2 mb-2 group">
                        <img
                            src="/images/logo.png"
                            alt="MoodMate Logo"
                            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="font-black text-2xl uppercase tracking-tighter">MoodMate</span>
                    </Link>
                    <p className="font-bold text-black/60 text-base mb-4 max-w-md">
                        Emotion-based music recommendations powered by AI.
                    </p>
                    <div className="w-full max-w-md h-[2px] bg-black/5 rounded-full mb-6" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 font-bold text-base">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                            <span>by</span>
                            <a
                                href="https://profession-folio.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-2 decoration-[#FB58B4]/30 hover:decoration-[#FB58B4] hover:bg-[#FB58B4] hover:text-white transition-all px-1 rounded-md"
                            >
                                Ranit Deria
                            </a>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-xs font-bold text-black/40">
                            <span>Infosys SPRINGBOARD Internship Project</span>
                            <span>&copy; {new Date().getFullYear()} MoodMate. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    // Logged In State: Refined Complex Footer
    return (
        <footer className="w-full bg-white px-6 py-12 mt-auto border-t border-black/10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
                    {/* Column 1: Brand */}
                    <div className="flex flex-col gap-4 items-start text-left">
                        <Link href="/home" className="flex items-center gap-2 group">
                            <img
                                src="/images/logo.png"
                                alt="MoodMate Logo"
                                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                            />
                            <span className="font-black text-2xl uppercase tracking-tighter">MoodMate</span>
                        </Link>
                        <p className="font-bold text-black/60 text-base max-w-sm">
                            The soul of your music, digitized. We help you find the perfect track for any feeling, turning random moments into a symphony of memories.
                        </p>
                        <p className="font-black text-[#7c3aed] drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)] text-lg uppercase stroke-text-sm">
                            Don't just listen. Feel the music.
                        </p>
                        <div className="flex items-center gap-2 font-bold text-base mt-2">
                            <span>Crafted with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                            <span>by</span>
                            <a
                                href="https://profession-folio.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-2 decoration-[#FB58B4]/30 hover:decoration-[#FB58B4] hover:bg-[#FB58B4] hover:text-white transition-all px-1 rounded-md"
                            >
                                Ranit Deria
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="flex flex-col gap-4 items-start text-left">
                        <h4 className="font-black text-xl uppercase tracking-wide text-[#7c3aed] drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)] stroke-text-sm mb-2">
                            Quick Links
                        </h4>
                        <Link href="/home" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Vibe Check</Link>
                        <Link href="/vibes" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Mood Presets</Link>
                        <Link href="/community" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Community</Link>
                        <Link href="/about" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">About Us</Link>
                    </div>

                    {/* Column 3: Legal */}
                    <div className="flex flex-col gap-4 items-start text-left">
                        <h4 className="font-black text-xl uppercase tracking-wide text-[#7c3aed] drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)] stroke-text-sm mb-2">
                            Legal
                        </h4>
                        <Link href="/privacy-policy" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Privacy Policy</Link>
                        <Link href="/terms" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Terms of Service</Link>
                        <Link href="/cookie-policy" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Cookie Policy</Link>
                        <Link href="/contact" className="font-bold text-black/60 hover:text-black hover:translate-x-1 transition-all">Contact</Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="w-full h-[1px] bg-black/10 mb-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-start gap-1 text-xs font-bold text-black/40">
                        <span>&copy; {new Date().getFullYear()} MoodMate. All rights reserved.</span>
                        <span className="text-[10px] opacity-80">Infosys SPRINGBOARD Internship Project</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="https://github.com/RanitDERIA" target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:bg-[#FACC55] hover:text-black transition-colors rounded-lg shadow-sm">
                            <Github className="w-4 h-4" />
                        </a>
                        <a href="https://www.linkedin.com/in/ranit-deria-916864257/" target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:bg-[#0077b5] transition-colors rounded-lg shadow-sm">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a href="mailto:bytebardderia@gmail.com" className="p-2 bg-black text-white hover:bg-red-500 transition-colors rounded-lg shadow-sm">
                            <Mail className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
