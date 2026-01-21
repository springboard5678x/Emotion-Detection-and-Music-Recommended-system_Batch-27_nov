'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Globe, Zap, Wand2, Hand, Heart, Star, Sun, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DashboardHeaderProps {
    fullName: string
    avatarUrl?: string
    email?: string
}

export function DashboardHeader({ fullName, avatarUrl, email }: DashboardHeaderProps) {
    const [greeting, setGreeting] = useState('Welcome back')
    const [compliment, setCompliment] = useState<{ text: string, icon: any }>({ text: 'Here is your emotional footprint.', icon: Sparkles })

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 5) setGreeting('Late night vibes')
        else if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')

        const compliments = [
            { text: "You're glowing today!", icon: Sparkles },
            { text: "Ready to conquer the world?", icon: Globe },
            { text: "Your vibe is unmatched.", icon: Zap },
            { text: "Let's make some magic.", icon: Wand2 },
            { text: "Good vibes only.", icon: Hand },
            { text: "You look fantastic!", icon: Heart },
            { text: "Time to shine.", icon: Star },
            { text: "Hope you're having a great day!", icon: Sun }
        ]
        // Pick one based on day of month to be semi-stable or just random
        setCompliment(compliments[Math.floor(Math.random() * compliments.length)])
    }, [])

    // Fallback initial
    const initial = fullName ? fullName[0].toUpperCase() : '?'

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt blur"></div>
                <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full bg-white p-[3px] shadow-xl">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-black/5">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-black text-black/20">{initial}</span>
                        )}
                    </div>
                </div>
            </div>


            <div className="text-center md:text-left space-y-2 pt-2">
                <Link href="/profile" className="inline-flex items-center gap-2 text-black/40 font-bold uppercase text-xs hover:text-black transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Profile
                </Link>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-black">
                    {greeting}, <br className="md:hidden" />
                    <span className="text-[#7c3aed]">{fullName}</span>
                </h1>
                <p className="text-black/60 text-lg md:text-xl font-bold max-w-2xl mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-2">
                    {compliment.text}
                    {compliment.icon && <compliment.icon className="w-5 h-5 text-[#FACC55]" />}
                </p>
            </div>
        </div>
    )
}
