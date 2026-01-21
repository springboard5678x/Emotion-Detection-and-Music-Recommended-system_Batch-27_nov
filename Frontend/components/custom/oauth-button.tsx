'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface OAuthButtonProps {
    provider: 'google' | 'github' | 'discord';
    mode: 'signin' | 'signup';
    onError?: (error: string) => void;
}

export function OAuthButton({ provider, mode, onError }: OAuthButtonProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleOAuth = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    // Critical: Tell Supabase where to send user after OAuth
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                onError?.(error.message);
            }
            // Note: If successful, browser will redirect to OAuth provider
            // No need to manually set loading to false
        } catch (err) {
            setLoading(false);
            onError?.('An unexpected error occurred');
        }
    };

    const providerConfig = {
        google: {
            name: 'Google',
            bgColor: 'bg-white',
            textColor: 'text-black',
            hoverColor: 'hover:bg-gray-50',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
            ),
        },
        github: {
            name: 'GitHub',
            bgColor: 'bg-[#24292F]',
            textColor: 'text-white',
            hoverColor: 'hover:bg-[#1b1f23]',
            icon: (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        discord: {
            name: 'Discord',
            bgColor: 'bg-[#5865F2]',
            textColor: 'text-white',
            hoverColor: 'hover:bg-[#4752C4]',
            icon: (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.06 13.06 0 0 0-1.012 2.083 18.253 18.253 0 0 0-7.79 0 13.08 13.08 0 0 0-1.026-2.083.076.076 0 0 0-.077-.037A19.736 19.736 0 0 0 3.67 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-2.02.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 2.016a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
        },
    };

    const config = providerConfig[provider];
    const buttonText = mode === 'signin'
        ? `Sign in with ${config.name}`
        : `Sign up with ${config.name}`;

    return (
        <button
            onClick={handleOAuth}
            disabled={loading}
            className={`w-full ${config.bgColor} ${config.hoverColor} ${config.textColor} font-bold text-sm py-3 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3`}
        >
            {
                loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {config.icon
                        }
                        < span > {buttonText}</span>
                    </>
                )
            }
        </button >
    );
}
