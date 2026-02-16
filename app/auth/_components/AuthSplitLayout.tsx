"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

interface AuthSplitLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    mode: "signin" | "signup";
}

export default function AuthSplitLayout({ children, title, subtitle, mode }: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen w-full flex bg-[#050505] text-white font-sans overflow-hidden">

            {/* --- LEFT SIDE: FUNCTIONAL FORM (40-50%) --- */}
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative z-20 bg-[#050505]">
                {/* Logo Area */}
                <div className="absolute top-8 left-8 sm:left-12 lg:left-20 z-50">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center text-black font-bold text-xs group-hover:bg-brand-violet transition-colors duration-500">
                            TVX
                        </div>
                        <span className="font-display font-bold text-lg tracking-wider group-hover:text-brand-cyan transition-colors">TRUSTVAULT X</span>
                    </Link>
                </div>

                {/* Form Container */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="w-full max-w-md mx-auto pt-24 pb-12" // Added pt-24 to clear logo
                >
                    <div className="mb-12">
                        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tighter mb-4 leading-[0.9]">
                            {title.split(" ").map((word, i) => (
                                <span key={i} className="block">{word}</span>
                            ))}
                        </h1>
                        <p className="text-slate-400 text-lg">{subtitle}</p>
                    </div>

                    {children}

                    <div className="mt-12 text-sm text-slate-500 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-[1px] bg-white/10 flex-1" />
                            <span>OR ACCESS WITH</span>
                            <div className="h-[1px] bg-white/10 flex-1" />
                        </div>
                        <div className="flex justify-center gap-6">
                            {['Google', 'GitHub', 'Wallet'].map((provider) => (
                                <button key={provider} className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                                    {provider}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Links */}
                <div className="absolute bottom-8 left-8 sm:left-12 lg:left-20 text-xs text-slate-600 flex gap-6">
                    <a href="#" className="hover:text-brand-cyan transition-colors">Privacy</a>
                    <a href="#" className="hover:text-brand-cyan transition-colors">Terms</a>
                    <a href="#" className="hover:text-brand-cyan transition-colors">Support</a>
                </div>
            </div>

            {/* --- RIGHT SIDE: IMMERSIVE 3D VISUAL (50-60%) --- */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center bg-[#020202] overflow-hidden">
                {/* 3D Liquid/Mesh Simulation using CSS/SVG */}
                <div className="absolute inset-0 w-full h-full opacity-60">
                    <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-brand-violet/30 rounded-full blur-[120px] animate-[pulse_8s_infinite]" />
                    <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-brand-cyan/20 rounded-full blur-[100px] animate-[pulse_12s_infinite]" />
                    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[150px] animate-[spin_20s_linear_infinite]" />
                </div>

                {/* Animated Mesh Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-30 perspective-[1000px] rotate-x-12" />

                {/* Content Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative z-10 max-w-lg text-center p-12 backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent">
                        Bank-Grade Security for Creative Assets.
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        "TrustVaultX isn't just a platform; it's a fortress. We secured our entire stealth startup IP here without a single leak."
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700" />
                        <div className="text-left">
                            <div className="font-bold text-white">Alex V.</div>
                            <div className="text-xs text-brand-cyan">CEO, Stealth AI</div>
                        </div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
