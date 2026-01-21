'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { OAuthButton } from '@/components/custom/oauth-button';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) {
                toast.error(signUpError.message);
            } else {
                toast.success('Check your email for confirmation link!');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">

            {/* Left Side - Branding (Green Theme) */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-[#3DD598] border-r-[3px] border-black p-8 relative overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-sm">
                    <div className="bg-white border-[3px] border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_#000] inline-block mb-4 rotate-[3deg]">
                        <img src="/images/logo.png" alt="MoodMate Logo" className="w-16 h-16 object-contain" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight">
                        Start Your <br /> <span className="text-white text-stroke-2">Journal</span> <br /> Today
                    </h1>
                    <p className="text-base font-bold text-black/80">
                        Create an account to track your vibes, get insights, and feel better.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-10 w-20 h-20 bg-[#FACC55] border-[3px] border-black rounded-full opacity-50 animate-bounce delay-75"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#A78BFA] border-[3px] border-black rounded-xl rotate-[-12deg] opacity-50"></div>
                <div className="absolute top-1/2 -left-12 w-48 h-48 bg-white border-[3px] border-black rounded-full opacity-20"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-black uppercase mb-1">Join MoodMate</h2>
                        <p className="text-black/60 font-bold text-sm">Create an account to track your vibes</p>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <OAuthButton
                            provider="google"
                            mode="signup"
                            onError={(err) => toast.error(err)}
                        />
                        <OAuthButton
                            provider="github"
                            mode="signup"
                            onError={(err) => toast.error(err)}
                        />
                        <OAuthButton
                            provider="discord"
                            mode="signup"
                            onError={(err) => toast.error(err)}
                        />
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-[3px] border-black/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 font-black text-black/40 uppercase tracking-widest">Or sign up with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-black ml-1 uppercase text-sm tracking-wider">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-black/40">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-4 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 text-sm"
                                />
                            </div>
                        </div>

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
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-4 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-black ml-1 uppercase text-sm tracking-wider">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-black/40">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#FAFAFA] border-[3px] border-black/10 rounded-xl py-3 pl-12 pr-12 font-bold focus:outline-none focus:border-black focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-black/20 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3DD598] text-black font-black text-lg py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-y-[-4px] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-wide"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-6 h-6" /></>}
                        </button>
                    </form>

                    <div className="text-center font-bold text-lg">
                        <p className="text-black/60">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black underline decoration-2 hover:bg-[#FACC55] hover:text-black px-2 py-0.5 rounded-md transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
