'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Cookie, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects (Matching Vibes Page) */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col gap-4 text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                    >
                        Privacy <span className="text-[#7c3aed]">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold text-black/60 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Your privacy is our priority. We handle your vibes with care and transparency.
                    </motion.p>
                </div>

                {/* Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5"
                >
                    <div className="space-y-12">
                        {/* Section 1: Introduction */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="w-6 h-6 text-[#7c3aed]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">1. The Basics</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                Welcome to MoodMate. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                            </p>
                        </section>

                        {/* Section 2: Data We Collect */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Eye className="w-6 h-6 text-[#3DD598]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">2. Face Data & Vibes</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-[#FFF8F0] border border-black/5 p-6 rounded-2xl relative overflow-hidden">
                                    <p className="text-lg font-bold text-black mb-2">
                                        Does MoodMate store my photos?
                                    </p>
                                    <p className="text-lg font-medium text-black/70 leading-relaxed">
                                        <span className="font-black text-[#FB58B4]">NO.</span> We process your facial expressions in real-time. The raw image is discarded immediately after analysis. We only store the resulting "Mood Vector" to improve your recommendations.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Third Party Integrations */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Server className="w-6 h-6 text-[#3b82f6]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">3. Third Parties</h2>
                            </div>
                            <div className="pl-14 text-lg font-medium text-black/70 leading-relaxed">
                                <p className="mb-4">
                                    To bring you the best tunes, we integrate with music providers like Spotify, Apple Music, and others.
                                </p>
                                <ul className="list-disc list-inside space-y-2 marker:text-[#FACC55]">
                                    <li>When you connect your Spotify account, we adhere to Spotify's Developer Policy.</li>
                                    <li>We do not share your facial data with these services.</li>
                                    <li>We only send search queries (e.g., "Sad Songs") to fetch playlists.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4: Cookies */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-yellow-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Cookie className="w-6 h-6 text-[#E3B645]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">4. Cookies</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                We use cookies to keep you logged in and to remember your vibe preferences. By using our site, you agree to our use of cookies.
                            </p>
                        </section>

                        {/* Section 5: Security */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-red-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Lock className="w-6 h-6 text-[#E34234]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">5. Security</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                We implement a variety of security measures to maintain the safety of your personal information. Your mood data is encrypted, and our servers are guarded by industry-standard protocols.
                            </p>
                        </section>

                        {/* Divider */}
                        <div className="w-full h-px bg-black/5 rounded-full my-8" />

                        {/* Contact */}
                        <section className="text-center">
                            <h3 className="text-2xl font-black uppercase mb-4">Have Questions?</h3>
                            <a
                                href="mailto:bytebardderia@gmail.com"
                                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-[#7c3aed] transition-all hover:scale-105 shadow-md"
                            >
                                <Mail className="w-5 h-5" />
                                bytebardderia@gmail.com
                            </a>
                        </section>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="text-center mt-12 font-bold text-black/30 text-sm">
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </main>
    );
}
