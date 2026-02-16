"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Lock, Zap, Layout, Fingerprint, CreditCard, FileText,
    Video, Award, Activity, Database, Search, UserCircle, Settings,
    Eye, EyeOff, MousePointer, Globe, Bot, Link as LinkIcon, Layers
} from 'lucide-react';
import { TypewriterText } from './TypewriterText';

const features = [
    { name: "Netflix-Grade DRM", icon: Lock },
    { name: "Anti-AI Cloning", icon: Fingerprint },
    { name: "Secure Zoom Meetings", icon: Video },
    { name: "Immutable IPFS Proof", icon: Database },
    { name: "Screen Recording Block", icon: EyeOff },
    { name: "Forensic Watermarking", icon: Activity },
    { name: "Crypto Wallet", icon: CreditCard },
    { name: "One-Step Tunneling", icon: Globe },
    { name: "AI Guide Bot", icon: Bot },
    { name: "Secure Hyperlinks", icon: LinkIcon },
    { name: "Startup Idea Protection", icon: Layers },
    { name: "Dynamic Watermark", icon: Shield },
    { name: "Tab Focus Protection", icon: Eye },
    { name: "Input Control", icon: MousePointer },
    { name: "Heartbeat Monitor", icon: Activity },
    { name: "TrustVaultX OS", icon: Layout },
    { name: "Verified Licensing", icon: Award },
    { name: "Payment Security", icon: Shield },
];

// Split features into 3 rows
const row1 = features.slice(0, 6);
const row2 = features.slice(6, 12);
const row3 = features.slice(12, 18);

export const FeatureCapsuleGrid = () => {
    return (
        <section className="relative w-full overflow-hidden bg-[#020408] py-8">
            {/* --- SCENE BACKGROUND --- */}

            {/* 1. Dark Gradient: Deep Teal (bottom-left) -> Deep Navy (top-right) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f2e3a] via-[#020408] to-[#0a1120] opacity-80" />

            {/* 2. Animated Gradient Mesh (Subtle) */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, #000 100%), repeating-linear-gradient(45deg, rgba(6,182,212,0.05) 0px, transparent 100px)'
                }}
            />

            {/* 3. Volumetric Fog Layers */}
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-brand-cyan/5 to-transparent blur-[80px]" />
            <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-brand-blue/5 to-transparent blur-[80px]" />

            {/* 4. Film Grain Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")' }}></div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-60 pointer-events-none" />


            <div className="relative z-10 flex flex-col gap-[1px] py-1">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-brand-cyan/80 uppercase tracking-[0.3em] mb-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    >
                        System Capabilities
                    </motion.h3>

                    <div className="min-h-[60px] flex items-center justify-center max-w-4xl mx-auto px-4 mt-6">
                        <TypewriterText
                            texts={[
                                "Protect creative work from theft, AI misuse, and fraud with autonomous security and verifiable proof.", // Message 1
                                "For freelancers, online educators, and clients, this is the most trustworthy platform.", // Message 2
                                "Provides secure protection for startup websites and idea sharing, while ensuring creator work is protected through licensed, secure collaboration environments." // Message 3
                            ]}
                            className="text-gray-400 text-sm md:text-base font-light tracking-wide leading-relaxed"
                            typingSpeed={20}
                            pauseDuration={3000}
                        />
                    </div>
                </div>

                {/* --- CONVEYOR BELT ROWS --- */}
                <MarqueeRowCSS features={row1} duration={45} reverse={false} delay={0} />
                <MarqueeRowCSS features={row2} duration={35} reverse={true} delay={2} />
                <MarqueeRowCSS features={row3} duration={25} reverse={false} delay={4} />
            </div>

            {/* Soft Ambient Teal Light Glow (Bottom Left) */}
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        </section>
    );
};

// Re-implementing Marquee with pure CSS for reliable Pause-On-Hover
const MarqueeRowCSS = ({ features, duration, reverse, delay }: { features: any[], duration: number, reverse: boolean, delay: number }) => {
    // Quadruple for safety
    const items = [...features, ...features, ...features, ...features];

    return (
        <div className="relative w-full overflow-hidden group py-2"> {/* Added py-2 for float room */}
            {/* Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020408] via-[#020408]/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020408] via-[#020408]/80 to-transparent z-20 pointer-events-none" />

            <div
                className={`flex gap-6 w-max hover:[animation-play-state:paused]`}
                style={{
                    animation: `marquee-${reverse ? 'reverse' : 'normal'} ${duration}s linear infinite`,
                    animationDelay: `-${delay}s` // Negative delay to start mid-animation if needed, or positive for staggered start
                }}
            >
                {items.map((feature, i) => (
                    <Capsule key={`${feature.name}-${i}`} feature={feature} />
                ))}
                {/* Duplicate set for smoother extensive scrolling if needed, but 4x items usually enough */}
            </div>

            <style jsx>{`
                @keyframes marquee-normal {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    )
}


const Capsule = ({ feature }: { feature: { name: string, icon: any } }) => {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{
                scale: 1.04,
                y: 0, // Reset Ambient float on hover? Or just scale.
                transition: { duration: 0.2, ease: "easeOut" }
            }}
            animate={{
                y: [0, -2, 0], // Ambient Float
            }}

            className="relative flex items-center gap-3 pl-2 pr-6 py-3 rounded-full cursor-pointer transition-all duration-300 group/capsule"
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
        >
            {/* Top Highlight (Inner) */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            {/* Hover Glow Border */}
            <div className="absolute inset-0 rounded-full ring-1 ring-brand-cyan/0 group-hover/capsule:ring-brand-cyan/50 transition-all duration-300" />

            {/* Hover Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-brand-cyan/20 blur-md opacity-0 group-hover/capsule:opacity-40 transition-opacity duration-300" />

            {/* Icon Circle */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 group-hover/capsule:text-brand-cyan group-hover/capsule:bg-brand-cyan/10 transition-colors duration-300 relative z-10">
                <Icon size={14} />
            </div>

            {/* Label */}
            <span className="text-sm font-medium text-white/85 tracking-wide whitespace-nowrap relative z-10 font-sans">
                {feature.name}
            </span>
        </motion.div>
    );
};
