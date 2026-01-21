'use client';

import { Camera, Music, Brain, Radio, ArrowRight, CheckCircle, Headphones, Activity, Zap, Smile } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { InteractiveGrid } from '@/components/custom/interactive-grid';

export default function LandingPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const features = [
        {
            icon: <Camera className="w-8 h-8 text-black" />,
            title: 'Emotion Detection',
            description: 'Real-time facial expression analysis to understand how you feel.',
            color: 'bg-[#FACC55]'
        },
        {
            icon: <Brain className="w-8 h-8 text-black" />,
            title: 'Smart Analysis',
            description: 'AI algorithms mapping emotions to musical parameters.',
            color: 'bg-[#FB58B4]'
        },
        {
            icon: <Radio className="w-8 h-8 text-black" />,
            title: 'Music Engine',
            description: 'Curated songs tagged by mood, genre, and energy.',
            color: 'bg-[#3DD598]'
        },
        {
            icon: <Headphones className="w-8 h-8 text-black" />,
            title: 'Instant Playlists',
            description: 'Personalized recommendations based on your emotional state.',
            color: 'bg-[#A78BFA]'
        }
    ];

    const scienceSteps = [
        {
            title: 'Face Scan',
            desc: 'Our AI analyzes 40+ facial landmarks to detect micro-expressions.',
            icon: <Camera className="w-6 h-6" />,
            color: 'bg-[#FB58B4]',
            rotate: 'rotate-[-2deg]'
        },
        {
            title: 'Mood Mapping',
            desc: 'Your emotion is mapped to audio features like tempo, key, and energy.',
            icon: <Activity className="w-6 h-6" />,
            color: 'bg-[#3DD598]',
            rotate: 'rotate-[1deg]'
        },
        {
            title: 'Sonic Match',
            desc: 'We query our database to find tracks that resonate with your vibe.',
            icon: <Music className="w-6 h-6" />,
            color: 'bg-[#FACC55]',
            rotate: 'rotate-[-1deg]'
        },
    ];

    return (
        <div ref={containerRef} className="flex flex-col gap-0 pb-0 w-full overflow-x-hidden bg-[#FFF8F0]">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden perspective-1000">
                {/* Animated Background Grid */}
                <InteractiveGrid />

                <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left: Text Content */}
                    <div className="flex flex-col gap-6 text-center lg:text-left pt-20 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            className="inline-block self-center lg:self-start bg-[#FACC55] border-[3px] border-black px-4 py-1 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] rotate-[-2deg] cursor-default"
                        >
                            AI-Powered Music Companion
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-black"
                        >
                            Your Mood.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB58B4] to-[#A78BFA] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
                                Your Music.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-black/70 max-w-lg mx-auto lg:mx-0"
                        >
                            MoodMate uses computer vision to detect your vibe and curates the perfect soundtrack instantly.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-4 justify-center lg:justify-start mt-4"
                        >
                            <Link
                                href="/signup"
                                className="group relative bg-[#3DD598] text-black text-xl font-black px-8 py-4 border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">Try It Now <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right: Visuals */}
                    <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center mt-10 lg:mt-0">
                        {/* Main Image Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: -3 }}
                            whileHover={{ rotate: 0, scale: 1.02 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative w-[260px] h-[340px] lg:w-[400px] lg:h-[500px] bg-[#FB58B4] border-[4px] border-black rounded-[40px] lg:rounded-[50px] shadow-[12px_12px_0px_0px_#000] lg:shadow-[16px_16px_0px_0px_#000] z-10 flex items-end justify-center overflow-hidden"
                        >
                            <img
                                src="/images/land.png"
                                alt="MoodMate User"
                                className="w-full h-full object-cover object-center grayscale-[20%] contrast-125 hover:grayscale-0 transition-all duration-500"
                            />
                        </motion.div>
                        
                        {/* Interactive Stickers */}
                        <motion.div
                            drag
                            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                            whileHover={{ scale: 1.1, cursor: "grab" }}
                            whileDrag={{ scale: 1.2, cursor: "grabbing" }}
                            animate={{ y: [0, -15, 0] }}
                            transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                            className="absolute top-8 lg:top-20 left-2 lg:left-10 z-20 bg-[#3DD598] border-[3px] border-black p-3 lg:p-4 rounded-xl shadow-[6px_6px_0px_0px_#000] lg:shadow-[8px_8px_0px_0px_#000] rotate-[-10deg]"
                        >
                            <Music className="w-6 h-6 lg:w-8 lg:h-8 text-black" />
                        </motion.div>

                        <motion.div
                            drag
                            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                            whileHover={{ scale: 1.1, cursor: "grab", rotate: 15 }}
                            whileDrag={{ scale: 1.2, cursor: "grabbing" }}
                            className="absolute top-1/2 -right-0 lg:-right-8 z-20 bg-[#FACC55] border-[3px] border-black p-4 lg:p-5 rounded-full shadow-[6px_6px_0px_0px_#000] lg:shadow-[8px_8px_0px_0px_#000] rotate-[10deg]"
                        >
                            <Activity className="w-8 h-8 lg:w-10 lg:h-10 text-black animate-pulse" />
                        </motion.div>

                        <motion.div
                            drag
                            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                            whileHover={{ scale: 1.05, cursor: "grab" }}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-6 lg:bottom-12 -left-0 lg:-left-8 z-20 bg-white border-[3px] border-black py-2 px-4 lg:py-3 lg:px-6 rounded-full shadow-[6px_6px_0px_0px_#000] lg:shadow-[8px_8px_0px_0px_#000] flex items-center gap-2 rotate-[5deg]"
                        >
                            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full animate-ping" />
                            <span className="font-black text-xs lg:text-sm text-black">Live Scanning</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black uppercase text-center mb-20"
                    >
                        <span className="inline-block bg-black text-white px-6 py-2 rotate-1 shadow-[8px_8px_0px_0px_#FACC55]">How It Works</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
                                className={`${feature.color} border-[3px] border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_#000] h-full flex flex-col`}
                            >
                                <div className="w-14 h-14 bg-white border-[3px] border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-3">{feature.title}</h3>
                                <p className="font-bold text-black/80 leading-7">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Science Behind It (Replaced Roadmap) */}
            <section className="max-w-7xl mx-auto px-4 w-full py-24">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-block bg-[#A78BFA] border-[3px] border-black px-4 py-1 font-black uppercase mb-6 shadow-[4px_4px_0px_0px_#000] -rotate-2"
                        >
                            Under the Hood
                        </motion.div>
                        <h2 className="text-5xl md:text-6xl font-black uppercase mb-8 leading-[0.9]">
                            The Science of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3DD598] to-[#FACC55] stroke-black" style={{ WebkitTextStroke: '2px black' }}>Good Vibes</span>
                        </h2>
                        <p className="text-xl font-bold text-black/70 mb-8">
                            We don't just guess. MoodMate combines advanced Computer Vision with Music Information Retrieval (MIR) to create a bridge between your biological expressions and sonic frequencies.
                        </p>
                        <Link href="/signup" className="font-black underline decoration-4 underline-offset-4 decoration-[#FB58B4] text-xl hover:bg-[#FB58B4] hover:text-white transition-all px-2">
                            Learn about our Tech Stack
                        </Link>
                    </div>

                    <div className="flex-1 space-y-8 w-full">
                        {scienceSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ scale: 1.02, translateX: 10 }}
                                className={`flex items-center gap-6 ${step.color} border-[3px] border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_#000] ${step.rotate}`}
                            >
                                <div className="bg-white border-[3px] border-black p-4 rounded-full shadow-[4px_4px_0px_0px_#000] shrink-0">
                                    {step.icon}
                                </div>
                                <div>
                                    <h4 className="font-black text-xl uppercase mb-1">{step.title}</h4>
                                    <p className="font-bold text-sm text-black/80">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Outcome Section */}
            <section className="bg-[#1a1a1a] py-24 px-4 text-white relative overflow-hidden">
                {/* Decorative background text */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none select-none">
                    <div className="text-[20vw] font-black uppercase leading-none whitespace-nowrap text-white/20 -rotate-6 translate-y-20">
                        MOOD MATE MOOD MATE
                    </div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                    >
                        <h2 className="text-5xl md:text-8xl font-black uppercase leading-tight mb-8">
                            Ready to <br />
                            <span className="text-[#FACC55] drop-shadow-[6px_6px_0px_#000]" style={{ textShadow: '4px 4px 0 #000' }}>Feel It?</span>
                        </h2>
                    </motion.div>

                    <p className="text-xl md:text-2xl font-bold text-white/80 mb-12 max-w-2xl mx-auto">
                        Join thousands of users who have discovered the soundtrack to their life. No credit card required.
                    </p>

                    <Link
                        href="/signup"
                        className="inline-block bg-[#FB58B4] text-black text-2xl font-black px-12 py-6 border-[4px] border-white rounded-full shadow-[8px_8px_0px_0px_#fff] hover:shadow-[12px_12px_0px_0px_#fff] hover:scale-105 hover:rotate-2 transition-all"
                    >
                        Get Started Now
                    </Link>
                </div>
            </section>
        </div>
    );
}

