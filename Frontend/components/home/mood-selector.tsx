import { Smile, CloudRain, Wind, Zap, Target, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

type MoodOption = {
    id: string;
    label: string;
    description: string;
    useWhen: string;
    color: string;
    textColor: string;
    icon: any;
    prompt: string;
};

const moods: MoodOption[] = [
    {
        id: 'happy',
        label: 'Happy',
        description: 'Upbeat tracks to elevate your mood.',
        useWhen: 'Celebrating, feeling good.',
        color: '#FACC55',
        textColor: '#000000',
        icon: Smile,
        prompt: 'I am feeling happy and upbeat.',
    },
    {
        id: 'sad',
        label: 'Sad',
        description: 'Soft, emotional tracks for reflection.',
        useWhen: 'Processing feelings, winding down.',
        color: '#94A3B8', // Muted Blue/Grey
        textColor: '#FFFFFF',
        icon: CloudRain,
        prompt: 'I am feeling sad and reflective.',
    },
    {
        id: 'chill',
        label: 'Chill',
        description: 'Relaxed, mellow sounds for calm.',
        useWhen: 'Resting, casual listening.',
        color: '#3DD598',
        textColor: '#000000',
        icon: Wind,
        prompt: 'I am feeling chill and relaxed.',
    },
    {
        id: 'energetic',
        label: 'Energetic',
        description: 'High-energy tracks to keep you moving.',
        useWhen: 'Working out, needing a push.',
        color: '#FB58B4',
        textColor: '#000000',
        icon: Zap,
        prompt: 'I am feeling super energetic.',
    },
    {
        id: 'focus',
        label: 'Focus',
        description: 'Minimal music for concentration.',
        useWhen: 'Studying, coding.',
        color: '#ffffff',
        textColor: '#000000',
        icon: Target,
        prompt: 'I need to focus and concentrate.',
    },
    {
        id: 'sleep',
        label: 'Sleep',
        description: 'Slow, soothing tracks to help unwind.',
        useWhen: 'Night routines, relaxation.',
        color: '#C4B5FD',
        textColor: '#000000',
        icon: Moon,
        prompt: 'I am trying to sleep and unwind.',
    },
];

interface MoodSelectorProps {
    onSelect: (prompt: string) => void;
    disabled?: boolean;
}

export function MoodSelector({ onSelect, disabled }: MoodSelectorProps) {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-black text-white px-3 py-1 font-bold uppercase text-sm tracking-wider rounded-md">Quick Vibes</span>
                <h3 className="font-bold text-xl">Select your mood</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {moods.map((mood) => (
                    <button
                        key={mood.id}
                        onClick={() => onSelect(mood.prompt)}
                        disabled={disabled}
                        className={`
                            relative group overflow-hidden text-left p-6 rounded-2xl border-2 border-black
                            transition-all duration-300 ease-out
                            hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-white
                        `}
                    >
                        {/* Accent Background on Hover */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                            style={{ backgroundColor: mood.color }}
                        />

                        <div className="relative z-10 flex flex-col items-start gap-4">
                            {/* Icon & Header */}
                            <div className="flex items-center gap-3 w-full">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black/10 group-hover:border-black shrink-0 transition-colors"
                                    style={{ backgroundColor: mood.color, color: mood.textColor }}
                                >
                                    <mood.icon className="w-5 h-5" />
                                </div>
                                <span className="font-black text-xl uppercase tracking-tight">{mood.label}</span>
                            </div>

                            {/* Details */}
                            <div className="space-y-1">
                                <p className="font-bold text-sm leading-tight text-black/80">
                                    {mood.description}
                                </p>
                                <p className="text-xs font-semibold text-black/50 mt-2">
                                    Use when: {mood.useWhen}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
