'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        // Required for Web3Forms
        formData.append("access_key", "2591a756-c880-4229-abbe-15f6cc2409b8");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to disable. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        Get in <span className="text-[#7c3aed]">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-bold text-black/60 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Got a question, suggestion, or just want to share your vibe? We're all ears.
                    </motion.p>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info (Left Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 space-y-6"
                    >
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-lg">Email Us</h3>
                                <a href="mailto:bytebardderia@gmail.com" className="font-medium text-black/60 hover:text-[#FB58B4] transition-colors break-all">
                                    bytebardderia@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-lg">Location</h3>
                                <p className="font-medium text-black/60">
                                    Kolkata, India
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form (Right Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-black/5"
                    >
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-[#3DD598] rounded-full flex items-center justify-center mb-2"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-black" />
                                </motion.div>
                                <h3 className="text-3xl font-black uppercase">Message Sent!</h3>
                                <p className="text-black/60 font-medium text-lg max-w-sm">
                                    Thanks for reaching out! We'll vibe check your message and get back to you soon.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-4 text-black font-bold underline hover:text-[#7c3aed]"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-black uppercase tracking-wider ml-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        placeholder="Your Name"
                                        className="w-full bg-[#FFF8F0] border-2 border-black/5 rounded-xl px-4 py-3 font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-black uppercase tracking-wider ml-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full bg-[#FFF8F0] border-2 border-black/5 rounded-xl px-4 py-3 font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>

                                {/* Message Input */}
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-black uppercase tracking-wider ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        required
                                        rows={5}
                                        placeholder="What's on your mind?"
                                        className="w-full bg-[#FFF8F0] border-2 border-black/5 rounded-xl px-4 py-3 font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 font-bold text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white font-black uppercase text-lg py-4 rounded-xl hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
