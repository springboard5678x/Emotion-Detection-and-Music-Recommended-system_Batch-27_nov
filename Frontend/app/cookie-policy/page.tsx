'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Settings, ToggleLeft, ShieldCheck, Mail } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects */}
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
                        Cookie <span className="text-[#7c3aed]">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold text-black/60 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        We use cookies to make your experience sweeter (and functional).
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
                        {/* Intro */}
                        <div className="bg-[#FFF8F0] border border-black/5 p-6 rounded-2xl mb-8">
                            <p className="text-lg font-medium text-black/70 leading-relaxed">
                                This Cookie Policy explains what cookies are, how MoodMate uses them, and your choices regarding them. This is not about the chocolate chip kind, unfortunately.
                            </p>
                        </div>

                        {/* Section 1: What are they? */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-yellow-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Cookie className="w-6 h-6 text-[#FACC55]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">1. What are Cookies?</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                Cookies are small text files sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
                            </p>
                        </section>

                        {/* Section 2: How We Use Them */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Settings className="w-6 h-6 text-[#3b82f6]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">2. How We Use Them</h2>
                            </div>
                            <div className="pl-14 text-lg font-medium text-black/70 leading-relaxed">
                                <p className="mb-4">We use cookies for the following purposes:</p>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-green-100 p-1.5 rounded-lg mt-1"><ShieldCheck className="w-4 h-4 text-[#3DD598]" /></div>
                                        <div>
                                            <span className="font-bold text-black block">Essential Cookies</span>
                                            To authenticate you and prevent fraudulent use of user accounts.
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-purple-100 p-1.5 rounded-lg mt-1"><Settings className="w-4 h-4 text-[#A78BFA]" /></div>
                                        <div>
                                            <span className="font-bold text-black block">Preferences Cookies</span>
                                            To remember your mood history and display settings.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3: Your Choices */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-red-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <ToggleLeft className="w-6 h-6 text-[#E34234]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">3. Your Choices</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer (like logging in to save your history).
                            </p>
                        </section>

                        {/* Divider */}
                        <div className="w-full h-px bg-black/5 rounded-full my-8" />

                        {/* Contact */}
                        <section className="text-center">
                            <h3 className="text-2xl font-black uppercase mb-4">Questions?</h3>
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
