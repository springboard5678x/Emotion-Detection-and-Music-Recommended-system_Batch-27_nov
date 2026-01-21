'use client';

import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import { UserNav } from './user-nav';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link href={user ? "/home" : "/landing"} className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter">
                        <img src="/images/logo.png" alt="MoodMate Logo" className="w-10 h-10 object-contain hover:scale-110 transition-transform" />
                        <span>MoodMate</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">

                        {user ? (
                            <>
                                <Link
                                    href="/home"
                                    className={`font-bold text-black border-b-2 transition-all hover:border-black ${(pathname?.startsWith('/home') ?? false) ? 'border-black' : 'border-transparent'
                                        }`}
                                >
                                    Home
                                </Link>

                                <Link
                                    href="/vibes"
                                    className={`font-bold text-black border-b-2 transition-all hover:border-black ${(pathname?.startsWith('/vibes') ?? false) ? 'border-black' : 'border-transparent'
                                        }`}
                                >
                                    Vibes
                                </Link>

                                <Link
                                    href="/community"
                                    className={`font-bold text-black border-b-2 transition-all hover:border-black ${(pathname?.startsWith('/community') ?? false) ? 'border-black' : 'border-transparent'
                                        }`}
                                >
                                    Community
                                </Link>

                                <UserNav user={user} />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="font-bold text-black border-b-2 border-transparent hover:border-black transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-[#FB58B4] text-black font-black px-6 py-2 border-[2px] border-black rounded-lg shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:translate-y-[-2px] transition-all"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 border-none rounded-md hover:bg-black/5"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden border-t-[3px] border-black bg-[#FFF8F0] overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <Link
                                href={user ? "/home" : "/landing"}
                                className="block font-bold text-lg p-2 hover:bg-black/5 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Home
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        href="/vibes"
                                        className="block font-bold text-lg p-2 hover:bg-black/5 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Vibes
                                    </Link>
                                    <Link
                                        href="/community"
                                        className="block font-bold text-lg p-2 hover:bg-black/5 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Community
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block font-bold text-lg p-2 hover:bg-black/5 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                </>
                            )}

                            {user ? (
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="block w-full text-left font-bold text-lg p-2 hover:bg-black/5 rounded-lg text-red-600 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block font-bold text-lg p-2 hover:bg-black/5 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block w-full text-center bg-[#FB58B4] text-black font-black px-6 py-3 border-[2px] border-black rounded-lg shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:translate-y-[-2px] transition-all mt-4"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
