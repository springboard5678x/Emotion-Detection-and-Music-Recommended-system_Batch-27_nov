'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Loader2, Save, User as UserIcon, Lock as LockIcon, RefreshCw, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Avatar States
    const [avatarType, setAvatarType] = useState<'initials' | 'image' | 'dicebear'>('initials');
    const [avatarSeed, setAvatarSeed] = useState('felix');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || '');
                setAvatarSeed(user.user_metadata?.avatar_seed || 'felix');
                const pref = user.user_metadata?.avatar_preference;
                if (pref) {
                    setAvatarType(pref);
                } else if (user.user_metadata?.avatar_url) {
                    setAvatarType('image');
                }
            }
            setLoading(false);
        };
        getUser();
    }, [supabase]);

    const handleUpdateProfile = async () => {
        setSaving(true);
        // setMessage(null); // Removed

        try {
            // 1. Update Auth Metadata (Private/Session)
            const updates = {
                full_name: fullName,
                name: fullName,
                display_name: fullName,
                avatar_preference: avatarType,
                avatar_seed: avatarSeed,
            };

            const { data: { user: updatedUser }, error: authError } = await supabase.auth.updateUser({
                data: updates,
            });

            if (authError) throw authError;

            // 2. Update Public Profile Table (For Community Feed)
            // Determine the correct avatar URL to save publicly
            let publicAvatarUrl = user?.user_metadata?.avatar_url || '';
            if (avatarType === 'dicebear') {
                publicAvatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    full_name: fullName,
                    avatar_url: publicAvatarUrl,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error("Error updating public profile:", profileError);
                // Don't block UI success for this, but log it.
            }

            toast.success('Profile updated successfully!');

            if (updatedUser) {
                setUser(updatedUser);
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setSaving(true);
        // setMessage(null); // Removed

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
            toast.success('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]"><Loader2 className="w-10 h-10 animate-spin" /></div>;
    if (!user) return null;

    const isOAuthUser = user.app_metadata.provider !== 'email' || user.identities?.some(id => id.provider !== 'email');
    const oauthProvider = user.app_metadata.provider === 'email' ? user.identities?.find(id => id.provider !== 'email')?.provider : user.app_metadata.provider;

    const getAvatarSrc = () => {
        if (avatarType === 'dicebear') return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${avatarSeed}`;
        if (avatarType === 'image') return user.user_metadata?.avatar_url || user.user_metadata?.picture;
        return null;
    };

    const getInitials = () => {
        const name = fullName || user.email || '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const avatarSrc = getAvatarSrc();

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-12">
            {/* Fixed Background Effects Layer - Same as Home/404 */}
            <div className="fixed -top-12 -left-12 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob -z-10" />
            <div className="fixed top-0 -right-4 w-64 h-64 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />
            <div className="fixed -bottom-8 left-20 w-64 h-64 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000 -z-10" />
            <div className="fixed bottom-40 right-20 w-48 h-48 bg-[#4ECDC4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />

            <Navbar />


            <div className="max-w-5xl mx-auto w-full px-6 flex-1">
                {/* Header Section */}
                <div className="mb-12 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
                        Profile <span className="text-[#7c3aed]">Settings</span>
                    </h1>
                    <p className="text-lg text-black/60 font-medium max-w-xl">
                        Manage your aesthetics, security, and personal details.
                    </p>
                </div>




                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar / Identity Card */}
                    <div className="lg:col-span-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-6 text-center relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 mx-auto rounded-full border border-black/10 overflow-hidden bg-white flex items-center justify-center relative shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-black">{getInitials()}</span>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-2xl font-black uppercase break-words leading-tight mb-1">{fullName || 'User'}</h2>
                            <p className="text-sm font-bold text-black/40 break-words mb-6">{user.email}</p>

                            <div className="flex flex-wrap justify-center gap-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl border border-black/5 text-sm font-bold uppercase tracking-wide text-black/70">
                                    {isOAuthUser ? (
                                        <>
                                            {oauthProvider === 'google' && (
                                                <svg className="w-5 h-5 bg-transparent" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                            )}
                                            {oauthProvider === 'github' && (
                                                <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                            )}
                                            {oauthProvider === 'discord' && (
                                                <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                                            )}
                                            {oauthProvider}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5 text-black" />
                                            Email Account
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Link (Sidebar) */}
                        <button
                            onClick={() => router.push('/my-vibe')}
                            className="w-full group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[24px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="text-left flex-1">
                                <span className="block text-white font-black uppercase text-xs tracking-wide">Vibe Dashboard</span>
                                <span className="block text-white/60 text-[10px] font-medium leading-none mt-0.5">Check analytics</span>
                            </div>
                            <svg className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Mini Stats or Info */}
                        {isOAuthUser ? (
                            <div className="bg-[#FACC55] rounded-[24px] border border-black/5 shadow-sm p-6 text-black/80 hover:shadow-md transition-shadow">
                                <h3 className="font-black uppercase text-xl mb-2 flex items-center gap-2 text-black">
                                    <LockIcon className="w-5 h-5" />
                                    Security
                                </h3>
                                <p className="text-sm font-bold opacity-90 leading-relaxed">
                                    Your password is managed securely by {oauthProvider}. It cannot be changed here.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-[#A78BFA] rounded-[24px] border border-black/5 shadow-sm p-6 text-white hover:shadow-md transition-shadow">
                                <h3 className="font-black uppercase text-xl mb-2">Pro Tip</h3>
                                <p className="text-sm font-medium opacity-90 leading-relaxed">
                                    Update your avatar to a "Fun Emoji" to match your current vibe on the leaderboard.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">

                        {/* 1. Personal Details */}
                        <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
                                <div className="p-2 bg-[#FACC55] rounded-lg border border-black/5 shadow-sm">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black uppercase">Personal Details</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-black/50 ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3 px-4 font-bold focus:outline-none focus:bg-white focus:border-black/5 focus:shadow-sm transition-all placeholder:text-black/20"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-black/50 ml-1">Email (Managed)</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full bg-gray-100 border-2 border-transparent rounded-xl py-3 px-4 font-bold text-black/40 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Avatar Customization */}
                        <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
                                <div className="p-2 bg-[#3DD598] rounded-lg border border-black/5 shadow-sm">
                                    <RefreshCw className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black uppercase">Avatar Style</h3>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl max-w-fit">
                                <button
                                    onClick={() => setAvatarType('initials')}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${avatarType === 'initials' ? 'bg-white text-black shadow-sm ring-1 ring-black/10' : 'text-black/50 hover:text-black'}`}
                                >
                                    Initials
                                </button>
                                {user.user_metadata?.avatar_url && (
                                    <button
                                        onClick={() => setAvatarType('image')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${avatarType === 'image' ? 'bg-white text-black shadow-sm ring-1 ring-black/10' : 'text-black/50 hover:text-black'}`}
                                    >
                                        Picture
                                    </button>
                                )}
                                <button
                                    onClick={() => setAvatarType('dicebear')}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${avatarType === 'dicebear' ? 'bg-white text-black shadow-sm ring-1 ring-black/10' : 'text-black/50 hover:text-black'}`}
                                >
                                    Fun Emoji
                                </button>
                            </div>

                            {avatarType === 'dicebear' && (
                                <div className="space-y-4 bg-gray-50 rounded-2xl p-6 border border-black/5">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {['felix', 'aneka', 'zane', 'benton', 'jia', 'liliana'].map((seed) => (
                                            <button
                                                key={seed}
                                                onClick={() => setAvatarSeed(seed)}
                                                className={`aspect-square rounded-xl border-2 overflow-hidden transition-all hover:scale-110 ${avatarSeed === seed ? 'border-black/10 shadow-md scale-110 ring-2 ring-[#3DD598] ring-offset-2' : 'border-transparent hover:border-black/10'}`}
                                            >
                                                <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={avatarSeed}
                                            onChange={(e) => setAvatarSeed(e.target.value)}
                                            className="flex-1 bg-white border border-black/5 rounded-xl py-2 px-4 font-bold text-sm focus:outline-none focus:border-black/20 transition-all"
                                            placeholder="Type for random seed..."
                                        />
                                        <button
                                            onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                                            className="p-2.5 bg-white border border-black/10 rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Save Action for Main Details */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="px-8 py-3 bg-black text-white font-black uppercase text-sm rounded-xl border border-transparent hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </div>

                        {/* 3. Security (Only for Email Users) */}
                        {!isOAuthUser && (
                            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
                                    <div className="p-2 bg-[#FF6B6B] rounded-lg border border-black/5 shadow-sm">
                                        <LockIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase">Security</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-black/50 ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3 px-4 pr-12 font-bold focus:outline-none focus:bg-white focus:border-black/5 focus:shadow-sm transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-black/50 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3 px-4 pr-12 font-bold focus:outline-none focus:bg-white focus:border-black/5 focus:shadow-sm transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={saving || !newPassword}
                                        className="px-6 py-2.5 bg-[#FF6B6B] text-black font-bold uppercase text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
