'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export function GreetingHeader() {
    const [name, setName] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const updateName = (user: any) => {
            if (!user) return;
            const meta = user.user_metadata || {};
            const fullName = meta.display_name || meta.full_name || meta.name;

            if (fullName) {
                setName(fullName.split(' ')[0]); // First name
            } else if (user.email) {
                setName(user.email.split('@')[0]);
            }
        };

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            updateName(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            updateName(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                {getGreeting()}, <br />
                <span className="text-[#7c3aed]">{name || 'Friend'}</span>
            </h1>
            <p className="font-bold text-black/60 mt-2">Ready to find your rhythm?</p>
        </div>
    );
}
