"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Pinterest-style "Cinematic" Easing
const EASE_PREMIUM = [0.22, 1, 0.36, 1];

export default function PremiumAuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-slate-200">
            {/* --- CINEMATIC ENVIRONMENT --- */}

            {/* 1. Deep Atmospheric Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]" />

            {/* 2. Slow Mesh Gradient Movement */}
            <motion.div
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                    backgroundSize: "120% 120%"
                }}
            />

            {/* 3. Subtle Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* 4. Volumetric Haze / Spotlights */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* --- PREMIUM AUTH CARD --- */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: EASE_PREMIUM, delay: 0.2 }}
                className="relative z-10 w-full max-w-[480px] p-4"
            >
                {/* Glass Panel */}
                <div className="relative overflow-hidden rounded-[32px] bg-white/[0.04] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15)]">

                    {/* Top Edge Light Catch */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />

                    <div className="p-10 md:p-12 relative">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: EASE_PREMIUM, delay: 0.4 }}
                            className="text-center mb-10"
                        >
                            {/* Animated Logo */}
                            <div className="w-16 h-16 mx-auto mb-6 relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-cyan rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                                <div className="relative bg-gradient-to-tr from-[#0f172a] to-[#1e293b] rounded-2xl w-full h-full flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">TVX</span>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">{title}</h1>
                            <p className="text-slate-400 text-sm font-medium tracking-wide leading-relaxed">{subtitle}</p>
                        </motion.div>

                        {/* Form Content */}
                        {children}
                    </div>
                </div>

                {/* Footer / Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase opacity-60 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 block animate-pulse" />
                        TrustVaultX Secure Environment
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
