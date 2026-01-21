'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArchitectureDiagram } from '@/components/custom/architecture-diagram';
import { Code2, Database, Layers, Cpu, Heart, Award, Brain, Monitor } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col gap-4 text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                    >
                        About <span className="text-[#7c3aed]">MoodMate</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-block bg-black text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm md:text-base mx-auto shadow-lg"
                    >
                        Infosys Springboard Internship 6.0 Project
                    </motion.div>
                </div>

                {/* Content Sections */}
                <div className="space-y-12">

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5 text-center"
                    >
                        <h2 className="text-3xl font-black uppercase mb-6">The Objective</h2>
                        <p className="text-xl font-medium text-black/70 max-w-4xl mx-auto leading-relaxed">
                            To develop an intelligent system that detects a user’s emotional state from facial expressions and recommends music that aligns with or enhances the user's mood using AI/ML techniques.
                        </p>
                    </motion.div>

                    {/* Architecture Section */}
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Detail Text */}
                        <div className="md:col-span-5 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Brain className="w-8 h-8 text-[#FB58B4]" />
                                    <h3 className="text-xl font-black uppercase">1. The Brain</h3>
                                </div>
                                <p className="font-medium text-black/70 mb-4">
                                    The core logic resides in a <strong>Flask-based Python</strong> environment.
                                </p>
                                <ul className="space-y-3 text-sm font-bold text-black/60">
                                    <li className="flex gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FB58B4] mt-1.5" />
                                        <span><strong>Computer Vision:</strong> PIL & NumPy process webcam frames (Resize, Grayscale, Normalize).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FB58B4] mt-1.5" />
                                        <span><strong>Deep Learning:</strong> A TensorFlow/Keras CNN classifies 7 discrete emotions.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FB58B4] mt-1.5" />
                                        <span><strong>Recommendation:</strong> Algorithms map emotions to acoustic features in the dataset.</span>
                                    </li>
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Monitor className="w-8 h-8 text-[#3DD598]" />
                                    <h3 className="text-xl font-black uppercase">2. The Interface</h3>
                                </div>
                                <p className="font-medium text-black/70">
                                    A <strong>Next.js</strong> frontend communicates via RESTful API. It captures base64 video streams, transmits them asynchronously, and dynamically updates the UI with sub-second latency.
                                </p>
                            </motion.div>
                        </div>

                        {/* Visual Diagram */}
                        <div className="md:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5 h-full flex flex-col justify-center"
                            >
                                <div className="mb-8 text-center md:text-left">
                                    <h3 className="text-2xl font-black uppercase mb-2">System Architecture</h3>
                                    <p className="font-bold text-black/40 text-sm">Decoupled Client-Server Pipeline</p>
                                </div>
                                <ArchitectureDiagram />
                            </motion.div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { img: "/images/flask.png", label: "Flask", sub: "Backend API" },
                            { img: "/images/tensorflow.png", label: "TensorFlow", sub: "Deep Learning" },
                            { img: "/images/numpy.png", label: "NumPy", sub: "Image Processing" },
                            { img: "/images/pandas.png", label: "Pandas", sub: "Data Analysis" },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col items-center text-center gap-3 hover:scale-105 transition-transform"
                            >
                                <div className="w-16 h-16 flex items-center justify-center mb-2">
                                    <img src={item.img} alt={item.label} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-sm">{item.label}</h4>
                                    <p className="text-xs font-bold text-black/40">{item.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer / Acknowledgements */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-black text-white rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[#7c3aed] opacity-20 blur-3xl rounded-full scale-150 animate-pulse" />

                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-full backdrop-blur-md">
                                <img src="/images/infosys.png" alt="Infosys Springboard" className="w-32 h-auto object-contain" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase mb-2">Acknowledgements</h3>
                                <p className="font-medium text-white/70 max-w-2xl mx-auto">
                                    Special thanks to the mentors and coordinators at <span className="text-[#FACC55] font-bold">Infosys Springboard</span> for their guidance throughout this internship program. This project wouldn't be possible without your support.
                                </p>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-wider">
                                    Project By: Ranit Deria
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
