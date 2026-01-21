"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface VibeBadgeProps {
    emotion: string;
    className?: string;
}

export function VibeBadge({ emotion, className = "" }: VibeBadgeProps) {
    const [randomStyle, setRandomStyle] = useState("bg-gradient-to-r from-gray-100 to-gray-200");

    useEffect(() => {
        // Fallback random styles for undefined emotions
        const styles = [
            "bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 animate-gradient-x",
            "bg-gradient-to-br from-green-300 to-yellow-300 animate-pulse",
            "bg-gradient-to-tr from-blue-200 to-cyan-200 animate-bounce-slow",
            "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 animate-pulse",
        ];
        setRandomStyle(styles[Math.floor(Math.random() * styles.length)]);
    }, []);

    // Determined styles based on keywords
    const getStyle = (emo: string) => {
        const lower = emo.toLowerCase();

        if (lower.includes('happy') || lower.includes('joy') || lower.includes('fun')) {
            return "bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 animate-gradient-x text-orange-900";
        }
        if (lower.includes('sad') || lower.includes('cry') || lower.includes('blue')) {
            return "bg-gradient-to-b from-blue-100 to-blue-300 animate-rain text-blue-900";
        }
        if (lower.includes('love') || lower.includes('romantic') || lower.includes('heart')) {
            return "bg-gradient-to-r from-pink-200 via-red-200 to-pink-200 animate-heartbeat text-pink-900";
        }
        if (lower.includes('angry') || lower.includes('mad') || lower.includes('rage')) {
            return "bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-shake text-white";
        }
        if (lower.includes('chill') || lower.includes('relax') || lower.includes('calm')) {
            return "bg-gradient-to-r from-teal-100 to-blue-100 animate-pulse-slow text-teal-900";
        }
        if (lower.includes('party') || lower.includes('dance')) {
            return "bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 animate-disco text-purple-900";
        }
        if (lower.includes('focus') || lower.includes('study') || lower.includes('work')) {
            return "bg-gray-100 border border-black/5 text-gray-700"; // Minimalist for focus
        }

        return `${randomStyle} text-black/80`;
    };

    const styleClass = getStyle(emotion);

    return (
        <div className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider border border-black/5 shadow-sm overflow-hidden relative ${styleClass} ${className}`}>
            {/* Shine effect overlay for extra "live" feel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine pointer-events-none" />
            <span className="relative z-10">{emotion}</span>
        </div>
    );
}
