'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Server, Brain, Database, Music, Monitor, ArrowRight } from 'lucide-react';

const steps = [
    {
        id: 'input',
        label: 'Input',
        icon: Camera,
        color: 'bg-[#FACC55]', // Yellow
        desc: 'Webcam Capture (Base64)'
    },
    {
        id: 'api',
        label: 'API Layer',
        icon: Server,
        color: 'bg-black text-white',
        desc: 'Flask REST API'
    },
    {
        id: 'processing',
        label: 'Preprocessing',
        icon: Monitor, // engaging icon for processing
        color: 'bg-[#FB58B4]', // Pink
        desc: 'PIL / NumPy (Gray, Resize)'
    },
    {
        id: 'model',
        label: 'CNN Model',
        icon: Brain,
        color: 'bg-[#7c3aed] text-white', // Purple
        desc: 'TensorFlow / Keras Detection'
    },
    {
        id: 'engine',
        label: 'Rec. Engine',
        icon: Database,
        color: 'bg-[#3DD598]', // Green
        desc: 'Pandas / Metadata Mapping'
    },
    {
        id: 'output',
        label: 'Output',
        icon: Music,
        color: 'bg-[#A78BFA]', // Light Purple
        desc: 'JSON Response & UI Update'
    }
];

export function ArchitectureDiagram() {
    return (
        <div className="w-full overflow-x-auto py-8 px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 min-w-[800px] relative">

                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-1 bg-black/10 -z-10" />

                {/* Animated Data Packets */}
                <motion.div
                    className="hidden md:block absolute top-[2.25rem] left-0 w-3 h-3 bg-black rounded-full -z-0"
                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                    className="hidden md:block absolute top-[2.25rem] left-0 w-3 h-3 bg-[#FB58B4] rounded-full -z-0"
                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
                />

                {steps.map((step, index) => (
                    <div key={step.id} className="relative flex flex-col items-center gap-4 group">

                        {/* Node */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            whileInView={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-20 h-20 rounded-2xl border-4 border-white shadow-[0px_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center relative z-10 ${step.color} transition-transform group-hover:scale-110`}
                        >
                            <step.icon className="w-8 h-8" />

                            {/* Connector Arrow (Mobile) */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden absolute -bottom-8 text-black/20">
                                    <ArrowRight className="w-6 h-6 rotate-90" />
                                </div>
                            )}
                        </motion.div>

                        {/* Label */}
                        <div className="text-center">
                            <h4 className="font-black uppercase text-sm">{step.label}</h4>
                            <p className="text-xs font-bold text-black/50 max-w-[100px]">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
