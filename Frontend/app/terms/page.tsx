'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Music, AlertTriangle, Copyright, HelpCircle, Mail } from 'lucide-react';

export default function TermsPage() {
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
                        Terms of <span className="text-[#7c3aed]">Service</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold text-black/60 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        The rules of the rhythm. Read these before you vibe.
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
                        {/* Section 1: Acceptance */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="w-6 h-6 text-[#3DD598]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">1. Acceptance</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                By accessing or using MoodMate, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. Basically, if you want to find your groove, you gotta play by the rules.
                            </p>
                        </section>

                        {/* Section 2: Service Description */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Music className="w-6 h-6 text-[#A78BFA]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">2. The Service</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                MoodMate is an AI-powered music recommendation engine. We use facial analysis and text input to suggest songs. While we strive for accuracy, music is subjective. If we recommend Heavy Metal for your "Chill Sunday" vibe, please forgive our algorithm—it's still learning human nuance.
                            </p>
                        </section>

                        {/* Section 3: User Conduct */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-yellow-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <AlertTriangle className="w-6 h-6 text-[#FACC55]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">3. Conduct</h2>
                            </div>
                            <div className="pl-14 text-lg font-medium text-black/70 leading-relaxed">
                                <p className="mb-4">You agree not to use the Service to:</p>
                                <ul className="list-disc list-inside space-y-2 marker:text-[#FB58B4]">
                                    <li>Violate any laws or regulations.</li>
                                    <li>Infringe upon the rights of others.</li>
                                    <li>Attempt to reverse-engineer our vibe-check technology.</li>
                                    <li>Upload malicious code or viruses (bad vibes).</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4: IP Rights */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Copyright className="w-6 h-6 text-[#3b82f6]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">4. Intellectual Property</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                The Service and its original content (excluding User Content and third-party music metadata) are and will remain the exclusive property of MoodMate and its licensors.
                            </p>
                        </section>

                        {/* Section 5: Disclaimer */}
                        <section className="group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-red-100 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <HelpCircle className="w-6 h-6 text-[#E34234]" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">5. Disclaimer</h2>
                            </div>
                            <p className="text-lg font-medium text-black/70 leading-relaxed pl-14">
                                MoodMate is provided on an "AS IS" basis. We make no warranties that the service will meet your requirements or that the music recommended will actually fix your bad mood. It's for entertainment purposes only—not a substitute for professional therapy or a good DJ.
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
