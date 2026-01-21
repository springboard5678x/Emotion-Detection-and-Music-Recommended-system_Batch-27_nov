'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserNavProps {
    user: User | null;
}

export function UserNav({ user }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (!user) return null;

    // Get user details
    const { email, user_metadata } = user;
    const fullName = user_metadata?.full_name;
    const avatarPreference = user.user_metadata?.avatar_preference || 'initials';
    const avatarSeed = user.user_metadata?.avatar_seed || 'felix';

    const getAvatarSrc = () => {
        if (avatarPreference === 'dicebear') return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`;
        if (avatarPreference === 'image') return user.user_metadata?.avatar_url || user.user_metadata?.picture;
        return null;
    };

    const avatarSrc = getAvatarSrc();

    // Generate initials
    const getInitials = () => {
        if (fullName) {
            const parts = fullName.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return fullName.substring(0, 2).toUpperCase();
        }
        if (email) {
            return email.substring(0, 2).toUpperCase();
        }
        return '??';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <div className="relative">
                    <div className="w-10 h-10 rounded-full border border-black/10 bg-white overflow-hidden shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-black text-sm text-black">
                                {getInitials()}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-black/60 group-hover:text-black transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-60 bg-white border border-black/5 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 origin-top-right"
                    >
                        {/* User Info Header */}
                        <div className="p-4 border-b border-black/5 bg-gray-50/50">
                            <p className="font-bold text-sm truncate text-black leading-tight">
                                {fullName || 'User'}
                            </p>
                            <p className="text-xs text-black/50 truncate font-semibold mt-0.5">
                                {email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-black/70 hover:text-black rounded-xl hover:bg-black/5 transition-all"
                            >
                                <UserIcon className="w-4 h-4" />
                                Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
