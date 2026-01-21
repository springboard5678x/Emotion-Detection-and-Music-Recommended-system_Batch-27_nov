'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { Suspense } from 'react';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const errorDescription = searchParams.get('error_description');
                if (errorDescription) {
                    toast.error(decodeURIComponent(errorDescription));
                } else {
                    toast.error('Invalid or expired link. Please request a new one.');
                }
            }
        };
        checkSession();
    }, [supabase.auth, searchParams]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Update password for the currently authenticated user
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                toast.error(updateError.message);
            } else {
                setSuccess(true);
                toast.success('Password updated! Redirecting...');
                // Redirect to login after 2 seconds (or home, since they are logged in)
                // But typically we ask them to login again or just go home
                setTimeout(() => {
                    router.push('/home'); // They are already logged in!
                }, 2000);
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">

            {/* Left Side - Branding (Yellow/Gold Theme) */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-[#FACC55] border-r-[3px] border-black p-8 relative overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-sm">
                    <div className="bg-white border-[3px] border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_#000] inline-block mb-4 rotate-[6deg]">
                        <img src="/images/logo.png" alt="MoodMate Logo" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight">
                        Fresh <br /> <span className="text-white text-stroke-2">Start</span> <br /> Ahead
                    </h1>
                    <p className="text-base font-bold text-black/80">
                        Secure your account and get back to your daily mood tracking.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-24 h-24 bg-[#3DD598] border-[3px] border-black rounded-full opacity-50 animate-bounce"></div>
                <div className="absolute bottom-20 left-20 w-16 h-16 bg-[#A78BFA] border-[3px] border-black rounded-xl rotate-[-12deg] opacity-50"></div>
                <div className="absolute top-1/2 -left-20 w-48 h-48 bg-white border-[3px] border-black rounded-full opacity-20"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-black uppercase mb-1">Reset Password</h2>
                        <p className="text-black/60 font-bold text-sm">
                            Create a new password for your account
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="font-black ml-1 uppercase text-sm tracking-wider">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-black/40">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-12 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="font-black ml-1 uppercase text-sm tracking-wider">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-black/40">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-12 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-[#3DD598] text-black font-black text-lg py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-y-[-4px] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {success ? 'Password Updated!' : 'Update Password'} <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center font-bold">
                        <Link
                            href="/login"
                            className="text-black/60 hover:text-black inline-flex items-center justify-center gap-2 hover:underline transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
