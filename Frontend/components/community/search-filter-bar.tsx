"use client";

import { Search, Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchFilterBarProps {
    onSearch: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    onCreatePost: () => void;
}

export function SearchFilterBar({ onSearch, activeFilter, onFilterChange, onCreatePost }: SearchFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
                <input
                    type="text"
                    placeholder="Search vibes..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-white border border-black/10 text-black px-12 py-3 rounded-2xl font-medium focus:outline-none focus:border-black/20 focus:shadow-sm transition-all placeholder:text-black/30"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30 group-focus-within:text-black/50 transition-colors" />
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto">
                {/* Filters */}
                <div className="flex items-center bg-white border border-black/5 rounded-2xl p-1 gap-1 flex-wrap md:flex-nowrap">
                    {[
                        { name: 'Latest', color: 'bg-black text-white' },
                        { name: 'Popular', color: 'bg-[#7c3aed] text-white' },
                        { name: 'Trending', color: 'bg-[#FB58B4] text-black' }
                    ].map((filter) => {
                        const isActive = activeFilter === filter.name;
                        return (
                            <motion.button
                                key={filter.name}
                                onClick={() => onFilterChange(filter.name)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-colors whitespace-nowrap z-10 ${isActive
                                    ? `${filter.color} shadow-md`
                                    : 'text-black/50 hover:text-black hover:bg-black/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className={`absolute inset-0 rounded-xl -z-10 ${filter.color}`}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{filter.name}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Create Button - Clean Style */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCreatePost}
                    className="bg-[#FACC55] text-black rounded-2xl px-4 py-2 md:px-6 md:py-3 font-bold uppercase text-xs md:text-sm tracking-wide border border-transparent hover:bg-[#E3B645] transition-all flex items-center gap-2 whitespace-nowrap ml-auto md:ml-0 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Share Vibe</span>
                </motion.button>
            </div>
        </div>
    );
}
