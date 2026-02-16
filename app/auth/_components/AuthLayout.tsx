"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Cinematic Easing
const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-slate-200 selection:bg-brand-cyan/30 selection:text-brand-cyan">
            {/* --- LAYERS OF ATMOSPHERE --- */}

            {/* Layer 1: Encrypted Grid (Faint) */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Layer 2: Ambient Gradient Bloom (Animated) */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-brand-violet/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-brand-cyan/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"
            />

            {/* Layer 3: Film Grain Overlay */}
            <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* --- AUTH CARD --- */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: EASE_CINEMATIC, delay: 0.2 }}
                className="relative z-10 w-full max-w-[440px] p-1"
            >
                {/* Glass Container */}
                <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] group transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">

                    {/* Top Highlight (Light Catch) */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                    <div className="p-10 relative">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: EASE_CINEMATIC, delay: 0.4 }}
                            className="text-center mb-10"
                        >
                            <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue to-brand-cyan rounded-2xl mx-auto mb-6 shadow-lg shadow-brand-cyan/20 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden">
                                <span className="relative z-10">TVX</span>
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-md">{title}</h1>
                            <p className="text-slate-400 text-sm font-medium tracking-wide">{subtitle}</p>
                        </motion.div>

                        {/* Content */}
                        {children}
                    </div>
                </div>

                {/* Secure Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="flex justify-center items-center gap-2 mt-8 opacity-40 hover:opacity-70 transition-opacity"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Secured by TrustVaultX</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
