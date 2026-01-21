'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (resetError) {
                toast.error(resetError.message);
            } else {
                setSuccess(true);
                toast.success('Reset link sent! Check your email.');
            }

        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">

            {/* Left Side - Branding (Purple Theme) */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-[#A78BFA] border-r-[3px] border-black p-8 relative overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-sm">
                    <div className="bg-white border-[3px] border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_#000] inline-block mb-4 rotate-[-6deg]">
                        <img src="/images/logo.png" alt="MoodMate Logo" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-[4px_4px_0px_0px_#000]">
                        Don't <br /> Worry <br /> Be Happy
                    </h1>
                    <p className="text-base font-bold text-white/90">
                        It happens to the best of us. Let's get you back on track.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-[#FACC55] border-[3px] border-black rounded-xl rotate-12 opacity-50 animate-bounce delay-100"></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-[#3DD598] border-[3px] border-black rounded-full opacity-50"></div>
                <div className="absolute top-1/2 -right-24 w-48 h-48 bg-white border-[3px] border-black rounded-full opacity-20"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-black uppercase mb-1">Forgot Password?</h2>
                        <p className="text-black/60 font-bold text-sm">
                            No worries! We'll send you a link to reset it.
                        </p>
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-black ml-1 uppercase text-sm tracking-wider">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-black/40">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@moodmate.com"
                                    required
                                    disabled={success}
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-4 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 disabled:opacity-50 text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-[#A78BFA] text-white font-black text-lg py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-y-[-4px] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 uppercase tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {success ? 'Link Sent!' : 'Send Link'} <ArrowRight className="w-6 h-6" />
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
