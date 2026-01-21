'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export function InteractiveGrid() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Base Grid (Faint) */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Hover Spotlight Grid (Stronger) */}
            <motion.div
                className="absolute inset-0 opacity-100 bg-[linear-gradient(to_right,#FB58B4_1px,transparent_1px),linear-gradient(to_bottom,#FB58B4_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
                style={{
                    maskImage: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
                    WebkitMaskImage: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
                }}
            />
        </div>
    );
}
