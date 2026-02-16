"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
    Shield, Lock, FileText, Video, MessageSquare, CreditCard,
    Globe, Database, CheckCircle, AlertTriangle, UserCheck,
    Server, Activity, Eye, EyeOff, Fingerprint, Award, Link2,
    Menu, X, ChevronDown, User, Settings, Layers, Zap, BarChart3, PieChart, ArrowUp
} from "lucide-react";
import { TypewriterText } from "./_components/TypewriterText";
import { SlidingTextV2 } from "./_components/SlidingText";
import { Chatbot } from "./_components/Chatbot";

// --- Navbar Component ---
function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Update scrolled state for background
            setScrolled(currentScrollY > 20);

            // Hide navbar when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past 100px
                setVisible(false);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/#features" },
        {
            name: "Workspace",
            href: "/dashboard",
            dropdown: [
                { name: "Agency Dashboard", href: "/dashboard?view=agency" },
                { name: "Client View", href: "/connect/client" },
                { name: "Creator View", href: "/connect/creator" }
            ]
        },
        {
            name: "Security",
            href: "/zoom",
            dropdown: [
                { name: "Secure Zoom", href: "/zoom" },
                { name: "DRM Settings", href: "/dashboard?tab=settings" }
            ]
        },
        {
            name: "Search Freelancers/Clients",
            href: "/search",
            dropdown: [
                { name: "Browse Profiles", href: "/search" },
                { name: "Post a Job", href: "/search" }
            ]
        },
        { name: "Wallet", href: "/dashboard?tab=wallet" },
    ];

    return (
        <nav
            onMouseMove={handleMouseMove}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? "bg-brand-black/60 backdrop-blur-xl border-b border-white/5 shadow-glass" : "bg-transparent"
                } ${visible ? "translate-y-0" : "-translate-y-full"}`}
        >
            {/* Liquid Glass Bubble Effect Container - Keeps overflow contained only for the bubble */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute bg-brand-cyan/20 rounded-full blur-[40px] mix-blend-screen"
                    animate={{
                        x: mousePos.x - 75,
                        y: mousePos.y - 75,
                        opacity: 1
                    }}
                    transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
                    style={{ width: 150, height: 150 }}
                />
            </div>

            <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center relative z-10">
                {/* Logo - Claymorphism */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative p-2.5 rounded-2xl bg-brand-surface shadow-clay border border-white/5 transition-transform duration-300 hover:scale-105">
                        <img
                            src="/TheLOGO!.png"
                            alt="TrustVaultX"
                            className="h-[38px] w-auto object-contain relative z-10 drop-shadow-md"
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-400">
                    {navLinks.map((link) => (
                        <div key={link.name} className="relative group p-1">
                            {link.dropdown ? (
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all duration-300 hover:backdrop-blur-md">
                                    {link.name}
                                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300 opacity-50" />
                                </button>
                            ) : (
                                <Link href={link.href} className="px-4 py-2 rounded-full hover:bg-white/5 hover:text-white transition-all duration-300 block hover:backdrop-blur-md">
                                    {link.name}
                                </Link>
                            )}

                            {/* Dropdown - Glass Effect */}
                            {link.dropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-glass opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 translate-y-2 group-hover:translate-y-0">
                                    {link.dropdown.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                        <Link href="/dashboard" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Profile">
                            <User size={18} />
                        </Link>
                        <Link href="/dashboard?tab=settings" className="p-2 text-gray-400 hover:text-brand-violet hover:bg-brand-violet/10 rounded-full transition-all" title="Settings">
                            <Settings size={18} />
                        </Link>
                    </div>
                    {/* Login / Sign up - Skeuomorphism */}
                    <Link href="/auth/signin" className="relative group px-6 py-2.5 rounded-full bg-brand-surface border border-white/5 shadow-skeuo active:shadow-skeuo-pressed active:scale-95 transition-all duration-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                        <div className="relative flex items-center gap-2 font-bold text-sm text-gray-200 group-hover:text-white group-hover:text-shadow-glow transition-colors">
                            Login / Sign up
                            <span className="group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                        </div>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-white p-2"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0A0A0A] border-b border-white/10 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <div key={link.name}>
                                    {link.dropdown ? (
                                        <div className="space-y-2">
                                            <div className="text-brand-blue font-medium text-xs uppercase tracking-widest pl-2">{link.name}</div>
                                            <div className="pl-4 border-l border-white/5 flex flex-col gap-1">
                                                {link.dropdown.map(item => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="text-gray-400 hover:text-white py-2 px-2 hover:bg-white/5 rounded-lg block transition-colors"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-lg font-medium text-white block py-2"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="w-full h-px bg-white/10 my-2"></div>
                            <Link
                                href="/auth/signin"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full py-3 bg-brand-surface border border-white/5 shadow-skeuo text-white text-center rounded-xl font-bold active:scale-95 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

// --- Footer Component ---
function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent"></div>
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-8">
                            <img
                                src="/TheLOGO!.png"
                                alt="TrustVaultX"
                                className="h-[58px] w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                            />
                        </div>
                        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed font-light">
                            Trust infrastructure for the AI era. Protecting creative work, enforcing fair payment, and generating immutable proof.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all border border-white/5 flex items-center justify-center cursor-pointer group">
                                <span className="group-hover:scale-110 transition-transform">𝕏</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all border border-white/5 flex items-center justify-center cursor-pointer group">
                                <span className="group-hover:scale-110 transition-transform">in</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-wide text-sm">PLATFORM</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/#features" className="hover:text-brand-blue transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-brand-blue transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-brand-blue transition-colors">Enterprise</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 tracking-wide text-sm">SECURITY</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-brand-blue transition-colors">Audits</Link></li>
                            <li><Link href="#" className="hover:text-brand-blue transition-colors">Compliance</Link></li>
                            <li><Link href="#" className="hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono">
                    <p>&copy; {new Date().getFullYear()} TrustVaultX Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><Lock size={10} /> SOC2 Compliant</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><Shield size={10} /> 256-bit AES</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// --- Page Components ---

function SectionHeader({ title, subtitle, className = "" }: { title: string, subtitle?: string, className?: string }) {
    return (
        <div className={`text-center mb-20 ${className}`}>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 mb-6"
            >
                {title}
            </motion.h2>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 max-w-2xl mx-auto text-xl font-light leading-relaxed"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}

function GlowingHeader({ title, subtitle, className = "" }: { title: string | React.ReactNode, subtitle?: string, className?: string }) {
    return (
        <div className={`text-center mb-20 ${className}`}>
            <div className="relative inline-block group">
                {/* Spreading Background Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0, 0.2, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-white blur-[40px] rounded-full -z-10"
                />

                {/* Glowing Text */}
                <motion.h2
                    animate={{
                        textShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 20px rgba(255,255,255,0.5)",
                            "0 0 0px rgba(255,255,255,0)",
                        ],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 relative z-10"
                >
                    {title}
                </motion.h2>
            </div>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 max-w-2xl mx-auto text-xl font-light leading-relaxed"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}

const Hero = () => {
    return (
        <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
            {/* Background Effects - Mesh Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full opacity-50 mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-brand-blue/20 blur-[100px] rounded-full opacity-40 animate-float"></div>
                <div className="absolute bottom-[0%] left-[10%] w-[500px] h-[500px] bg-brand-cyan/5 blur-[100px] rounded-full opacity-40 animate-float-delayed"></div>
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_100%)]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col gap-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 w-fit backdrop-blur-md shadow-glass-inset">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
                        </span>
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Trust Infrastructure v2.0</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold leading-[1] tracking-tight">
                        Trust <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-blue">
                            Infrastructure
                        </span> <br />
                        for AI Era
                    </h1>

                    <div className="text-xl text-gray-400 max-w-xl leading-relaxed font-light border-l-2 border-white/10 pl-6 min-h-[120px] flex items-center">
                        <SlidingTextV2
                            texts={[
                                "Protect creative work from theft, AI misuse, and fraud with autonomous security and verifiable proof.", // Message 1
                                "For freelancers, online educators, and clients, this is the most trustworthy platform.", // Message 2
                                "Provides secure protection for startup websites and idea sharing, while ensuring creator work is protected through licensed, secure collaboration environments." // Message 3
                            ]}
                            className="text-gray-400"
                            slideDuration={1.2}
                            pauseDuration={3000}
                        />
                    </div>

                    <div className="flex flex-wrap gap-5 mt-6">
                        <Link href="/auth/signup" className="inline-flex items-center justify-center px-10 py-4 bg-brand-cyan text-white font-bold rounded-full hover:bg-brand-cyan/90 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300">
                            Get Started
                        </Link>
                        <button className="px-10 py-4.5 bg-white/5 border border-white/10 text-white font-medium rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 group backdrop-blur-md">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div>
                            </div>
                            How It Works
                        </button>
                    </div>
                </motion.div>

                {/* Hyper-Real Dashboard Preview (3D Float Effect) */}
                <motion.div
                    initial={{ opacity: 0, rotateX: 10, rotateY: -10, scale: 0.9 }}
                    animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative hidden lg:block perspective-1000"
                >
                    <div className="relative z-20 aspect-video rounded-2xl p-[1px] group">
                        {/* Rotating Glow/Border Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff00ff] via-brand-cyan to-[#ff00ff] rounded-2xl blur opacity-30 group-hover:opacity-75 animate-[spin_4s_linear_infinite] transition-opacity duration-500"></div>

                        {/* Main Container */}
                        <div className="relative h-full w-full bg-brand-navy/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">

                            {/* Motion Graphics Video Background */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen pointer-events-none"
                            >
                                <source src="/Mg.mp4" type="video/mp4" />
                            </video>

                            {/* Glassmorphism Overlay Box */}
                            <div className="relative z-10 w-3/4 h-3/4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_0_rgba(255,0,255,0.15)] flex flex-col items-center justify-center p-6 text-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-[#ff00ff]/10 rounded-xl"></div>

                                {/* Decoration Icons */}
                                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#ff00ff]/20 rounded-full blur-xl animate-pulse"></div>
                                    <Shield className="w-10 h-10 text-[#ff00ff] relative z-10 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Trust Infrastructure</h3>
                                <p className="text-gray-300 text-sm font-light">AI Era Protection Active</p>

                                {/* Rotating Ring Decoration */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#ff00ff]/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Floating Badges */}
                        <div className="absolute -right-6 top-10 bg-[#0A0A0A]/80 backdrop-blur-md border border-[#ff00ff]/30 p-3 rounded-lg shadow-lg animate-float">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-ping"></span>
                                <span className="text-xs font-mono text-[#ff00ff]">LIVE PROTECTION</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
            >
                <span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-brand-blue/50 to-transparent"></div>
            </motion.div>
        </section>
    );
};

import { ScrollReveal } from './_components/ScrollReveal';
import { FeatureCapsuleGrid } from './_components/FeatureCapsuleGrid';

const FeatureCard = ({ title, description, icon: Icon, delay, color = "blue" }: any) => {
    // Advanced Glass Card
    const colorVariants: any = {
        blue: "hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] hover:border-brand-blue/50",
        red: "hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] hover:border-brand-rose/50",
        purple: "hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)] hover:border-brand-violet/50",
        emerald: "hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] hover:border-brand-emerald/50",
        cyan: "hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] hover:border-brand-cyan/50",
        orange: "hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] hover:border-orange-500/50",
        magenta: "hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)] hover:border-fuchsia-500/50",
    };

    const iconColors: any = {
        blue: "text-brand-blue bg-brand-blue/10",
        red: "text-brand-rose bg-brand-rose/10",
        purple: "text-brand-violet bg-brand-violet/10",
        emerald: "text-brand-emerald bg-brand-emerald/10",
        cyan: "text-brand-cyan bg-brand-cyan/10",
        orange: "text-orange-500 bg-orange-500/10",
        magenta: "text-fuchsia-500 bg-fuchsia-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
                scale: { duration: 0.25, ease: "easeOut" }
            }}
            className={`group p-8 bg-brand-navy/50 backdrop-blur-md border border-white/5 rounded-[20px] relative overflow-hidden ${colorVariants[color]}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className={`p-4 rounded-2xl w-fit mb-6 transition-all duration-300 group-hover:scale-110 ${iconColors[color]}`}>
                <Icon size={28} strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-bold mb-3 text-white tracking-tight relative z-10">{title}</h3>
            <p className="text-gray-400 text-base leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors">{description}</p>
        </motion.div>
    );
};

const ProblemSection = () => {
    return (
        <section className="pt-[13px] pb-[124px] relative z-10">
            <div className="container mx-auto px-6">
                <ScrollReveal width="100%">
                    <GlowingHeader
                        title="The Broken Trust"
                        subtitle="In the digital age, your work is vulnerable. Stolen in seconds, cloned instantly."
                        className="flex flex-col items-center justify-center text-center mx-auto"
                    />
                </ScrollReveal>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        title="Work Theft"
                        description="Screenshots, recordings, and inspect element allow anyone to copy your work without paying."
                        icon={AlertTriangle}
                        delay={0.1}
                        color="orange"
                    />
                    <FeatureCard
                        title="AI Cloning"
                        description="Your demos and sites are fed into AI tools to generate clones instantly."
                        icon={Fingerprint}
                        delay={0.2}
                        color="purple"
                    />
                    <FeatureCard
                        title="Payment Fraud"
                        description="Clients deny payments after receiving work, or dispute valid deliverables."
                        icon={CreditCard}
                        delay={0.3}
                        color="magenta"
                    />
                    <FeatureCard
                        title="No Proof"
                        description="Chats deleted, calls forgotten. No immutable record of agreements or feedback."
                        icon={FileText}
                        delay={0.4}
                        color="emerald"
                    />
                </div>
            </div>
        </section>
    );
}

const SolutionOverview = () => {
    return (
        <section className="py-32 relative overflow-hidden" id="features">
            {/* Radial gradient background specific to this section */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-cyan/5 rounded-full blur-[150px] -z-10"></div>

            <div className="container mx-auto px-6 relative z-10">
                <GlowingHeader title="TrustVaultX OS" subtitle="The complete operating system for trust." />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-center">
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <FeatureCard title="Netlfix-Grade DRM" description="Block screenshots, recordings, and dev tools." icon={Lock} delay={0} color="blue" />
                        <FeatureCard title="Secure Meetings" description="Zoom-like secure calls with auto-recording and transcripts." icon={Video} delay={0.1} color="cyan" />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center py-12 md:py-0">
                        {/* Central Animated Graphic */}
                        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center group">
                            <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-[80px] animate-pulse-slow"></div>
                            {/* Spinning Rings */}
                            <div className="absolute inset-0 border border-brand-cyan/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-8 border border-brand-cyan/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                            {/* Sparkling Particles */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:3s]"></div>
                                <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse [animation-duration:2s]"></div>
                                <div className="absolute top-10 right-10 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:4s]"></div>
                                <div className="absolute bottom-10 left-10 w-2 h-2 bg-brand-cyan/50 rounded-full animate-pulse [animation-duration:5s]"></div>
                            </div>

                            <div className="relative w-40 h-40 bg-[#0F1115] border border-brand-cyan/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)] z-10 group-hover:scale-105 transition-transform duration-500">
                                <Shield className="w-20 h-20 text-brand-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <FeatureCard title="Proof-First Logging" description="Immutable timeline of every chat, file, and click." icon={Activity} delay={0.2} color="emerald" />
                        <FeatureCard title="Authorized Licensing" description="Blockchain-backed ownership verification." icon={Award} delay={0.3} color="cyan" />
                    </div>
                </div>
            </div>
        </section>
    )
}

import { SplitReveal } from './_components/SplitReveal';

const DRMShowcase = () => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <section className="py-24 bg-brand-black relative z-10" id="drm">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                <SplitReveal direction="left" width="100%">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 w-fit">
                            <Lock size={14} className="text-brand-blue" />
                            <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">Advanced Security</span>
                        </div>
                        <GlowingHeader
                            title="User-Specific DRM Protection"
                            subtitle="Share your work without fear (Client/Creator). Our advanced player blocks screen capture, DevTools, and unauthorized sharing."
                            className="text-left mb-10"
                        />
                        <ul className="space-y-6">
                            {[
                                "Dynamic Watermarking (User ID, IP, Time)",
                                "Screenshot & Recording Blocking",
                                "Inspect Element Disabled",
                                "Time-Limited Access Links"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-gray-300 text-lg group">
                                    <div className="p-1 rounded-full bg-brand-emerald/10 text-brand-emerald group-hover:scale-110 transition-transform">
                                        <CheckCircle size={20} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </SplitReveal>

                <SplitReveal direction="right" width="100%" delay={0.2}>
                    <div
                        className="relative rounded-3xl overflow-hidden border border-white/10 bg-brand-navy shadow-2xl group hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out"
                        style={{
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden',
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            <div className="px-4 py-1.5 bg-brand-rose/10 border border-brand-rose/20 rounded-full text-brand-rose text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                                <div className="w-2 h-2 bg-brand-rose rounded-full animate-pulse"></div> REC BLOCKED
                            </div>
                        </div>

                        <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
                            {/* Video Watermark Background */}
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                            <video
                                src="/confidential_watermark_diagonal_loop.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
                            />

                            <div className="text-center p-12 relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Lock size={32} className="text-white opacity-80" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Confidential Project V1</h3>
                                <p className="text-gray-400">Restricted Access • Watermarked</p>
                            </div>

                            {/* Recording Block Noise Effect (Simulated) */}
                            <div className="absolute inset-0 bg-noise opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                    </div>
                </SplitReveal>
            </div>
        </section>
    );
};


const IPFSProofShowcase = () => {
    return (
        <section className="py-32 relative overflow-hidden bg-brand-dark">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
                <SplitReveal direction="left" width="100%">
                    <div className="order-2 md:order-1 relative">
                        {/* Floating IPFS Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-brand-surface/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-glass max-w-lg mx-auto skew-y-1 hover:skew-y-0 transition-all duration-700 ease-out group hover:border-brand-cyan/30"
                        >
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-cyan/10 rounded-xl">
                                        <Database size={24} className="text-brand-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base">IPFS Metadata Node</h3>
                                        <p className="text-xs text-brand-cyan font-mono mt-1">Status: IMMUTABLE</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-500 border border-white/10 px-3 py-1.5 rounded-full bg-black/20">
                                    Block #1928401
                                </div>
                            </div>

                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <span className="text-gray-500">Creator</span>
                                    <span className="text-white">Alex.Eth</span>
                                </div>
                                <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <span className="text-gray-500">Client</span>
                                    <span className="text-white">DesignCorp LLC</span>
                                </div>
                                <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <span className="text-gray-500">Work Scope</span>
                                    <span className="text-white text-right max-w-[150px] truncate">E-commerce UI Kit v2...</span>
                                </div>
                                <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <span className="text-gray-500">Value</span>
                                    <span className="text-brand-emerald font-bold">$1,200.00 USDC</span>
                                </div>
                                <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <span className="text-gray-500">Timestamp</span>
                                    <span className="text-gray-400">2024-10-24 14:30:05 UTC</span>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-brand-cyan/70 uppercase">IPFS Content Identifier (CID)</p>
                                    </div>
                                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] text-gray-400 break-all font-mono hover:text-brand-cyan transition-colors cursor-pointer hover:border-brand-cyan/20">
                                        QmX7yZa9s1bC4dE8fG2hJ3kL5mN6oP7qR8sT9uV0wXyZ
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </SplitReveal>

                <SplitReveal direction="right" width="100%">
                    <div className="order-1 md:order-2">
                        <GlowingHeader
                            title="Proof Beyond Doubt"
                            subtitle="Every deliverable is cryptographically sealed. We store unalterable metadata on IPFS linked to the blockchain."
                            className="text-left mb-6"
                        />
                        <div className="space-y-8 mt-8">
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 flex items-center justify-center shrink-0 border border-brand-cyan/20">
                                    <FileText size={24} className="text-brand-cyan" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Verifiable Ownership</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        Prove you created it. Prove they approved it. The metadata records the exact moment of handoff and payment agreement.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0 border border-brand-blue/20">
                                    <Link2 size={24} className="text-brand-blue" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Permanent Ledger</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        Unlike chat logs that can be deleted, IPFS records are distributed and permanent. Perfect evidence for dispute resolution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SplitReveal>
            </div>
        </section>
    );
};

const SecureMeetShowcase = () => {
    return (
        <section className="py-32 relative z-10" id="meet">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-brand-navy border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-brand-rose animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-300 uppercase">Live Recording</span>
                    </div>
                    <GlowingHeader
                        title="Secure Meetings"
                        subtitle="Every word recorded, summarized, and verifiable."
                    />
                </div>

                <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-brand-navy">
                    {/* Fake UI for Zoom-like interface */}
                    <div className="flex border-b border-white/5 p-4 items-center justify-between bg-brand-dark">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors"></div>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                            <span className="text-sm text-gray-400 font-mono flex items-center gap-2">
                                <Lock size={12} /> Secure Call: Project Kickstarter
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-lg bg-black/20 backdrop-blur-sm">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse relative z-10 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"></div>
                                <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                            RECORDING
                        </div>
                    </div>

                    <div className="grid grid-cols-12 h-[500px]">
                        <div className="col-span-8 bg-black/50 border-r border-white/5 relative flex items-center justify-center p-8">
                            <div className="text-center w-full max-w-md">
                                <div className="w-32 h-32 rounded-full bg-gray-800 mx-auto mb-6 border-4 border-brand-blue/30 flex items-center justify-center relative">
                                    {/* Magenta Wave Animation */}
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0.5, scale: 1 }}
                                            animate={{ opacity: 0, scale: 2.5 }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.6,
                                                ease: "easeOut"
                                            }}
                                            className="absolute inset-0 rounded-full border border-[#ff00ff]/40 z-0"
                                        />
                                    ))}
                                    <div className="relative z-10 flex items-center justify-center w-full h-full bg-gray-800 rounded-full overflow-hidden">
                                        <User size={60} className="text-white/20" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 z-20 w-8 h-8 bg-brand-blue rounded-full border-4 border-black flex items-center justify-center">
                                        <Zap size={14} className="text-white fill-white" />
                                    </div>
                                </div>
                                <p className="text-white font-medium text-lg">Freelancer (You)</p>
                                <div className="mt-8 flex justify-center gap-4">
                                    <div className="p-3 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"><span className="opacity-50">🎤</span></div>
                                    <div className="p-3 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"><span className="opacity-50">📹</span></div>
                                    <div className="p-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer text-white px-6 font-bold">End Call</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-4 bg-brand-dark flex flex-col border-l border-white/5">
                            <div className="p-4 border-b border-white/5 bg-brand-navy">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-brand-cyan rounded-full"></span> AI Live Summary
                                </h4>
                            </div>
                            <div className="flex-1 overflow-auto p-4 space-y-4">
                                <div className="p-4 bg-brand-blue/5 rounded-xl border border-brand-blue/10 text-xs shadow-sm">
                                    <span className="font-bold text-brand-blue block mb-1 uppercase tracking-wide">Action Item Detected</span>
                                    <p className="text-gray-300">Budget confirmed at <span className="text-white font-bold">$5,000</span> via Escrow.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl text-xs text-gray-400">
                                    <span className="font-bold text-gray-500 block mb-1">Client (04:20)</span>
                                    "I need the first draft by Friday close of business."
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl text-xs text-gray-400">
                                    <span className="font-bold text-gray-500 block mb-1">Freelancer (04:21)</span>
                                    "Confirmed. I will upload to the secure workspace."
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const WalletShowcase = () => {
    return (
        <section className="py-32 relative bg-brand-black overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[150px] opacity-100"></div>

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center relative z-10">
                {/* Visual Side */}
                <SplitReveal direction="left" width="100%">
                    <div className="relative">
                        <div className="relative z-10 bg-brand-navy/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-700 ease-out group">
                            {/* Wallet Card */}
                            <div className="bg-gradient-to-r from-brand-blue to-brand-cyan rounded-2xl p-8 mb-10 text-white shadow-lg relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]"></div>
                                <div className="flex justify-between items-start mb-12 relative z-10">
                                    <span className="text-sm font-mono opacity-80 tracking-wider">TrustVaultX Wallet</span>
                                    <Shield size={22} className="opacity-80" />
                                </div>
                                <div className="text-4xl font-bold mb-3 relative z-10">$12,450.00</div>
                                <div className="flex items-center gap-2 text-sm opacity-90 relative z-10">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Secured on Middleware Blockchain
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className="space-y-4">
                                {[
                                    { title: "Payment from Client A", amount: "+$500.00", status: "Escrow Locked", color: "text-brand-cyan" },
                                    { title: "Funds Added via UPI", amount: "+$2,000.00", status: "Verified", color: "text-green-400" },
                                    { title: "Dev Team Payout", amount: "-$1,200.00", status: "Processing", color: "text-gray-400" },
                                ].map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-black rounded-lg text-gray-400 border border-white/5"><Activity size={18} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-200">{tx.title}</div>
                                                <div className="text-xs text-gray-500">{tx.status}</div>
                                            </div>
                                        </div>
                                        <div className={`font-mono font-bold ${tx.color}`}>{tx.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SplitReveal>

                {/* Text Side */}
                <SplitReveal direction="right" width="100%">
                    <div>
                        <GlowingHeader
                            title="Universal Secure Wallet"
                            subtitle="The bridge between traditional finance and blockchain security."
                            className="text-left mb-10"
                        />
                        <div className="space-y-10">
                            <div className="flex gap-6">
                                <div className="p-4 bg-brand-blue/10 rounded-2xl h-fit border border-brand-blue/20">
                                    <CreditCard size={32} className="text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Pay with UPI, Cards, or Bank</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        Load your wallet seamlessly using your preferred local methods (UPI, Credit/Debit Cards, Net Banking). No crypto knowledge required.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="p-4 bg-brand-blue/10 rounded-2xl h-fit border border-brand-blue/20">
                                    <Database size={32} className="text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Blockchain Middleware Security</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        Once deposited, your funds are tokenized and secured by our <strong>Blockchain Middleware</strong>. Every transaction is immutable, traceable, and protected from fraud.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="p-4 bg-brand-emerald/10 rounded-2xl h-fit border border-brand-emerald/20">
                                    <Lock size={32} className="text-brand-emerald" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Smart Escrow Protection</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        Payments are held in Smart Contract Escrow. Funds are only released when work is verifiable and approved, protecting both creators and clients.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SplitReveal>
            </div>
        </section>
    );
}

const LiveThreatMonitor = () => {
    return (
        <section className="py-24 bg-brand-black relative border-t border-white/5 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <SplitReveal direction="left" width="100%">
                    <div className="order-2 lg:order-1">
                        {/* Restored Dashboard Mockup */}
                        <div className="relative z-20 bg-brand-navy/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-700 ease-out group">
                            {/* Dashboard Mockup */}
                            <div className="bg-brand-dark rounded-xl overflow-hidden border border-white/5 aspect-[16/11] relative">
                                {/* Navbar Mock */}
                                <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-brand-navy">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <div className="flex gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                        <span>TrustVaultX OS</span>
                                        <span className="text-brand-emerald">● Connected</span>
                                    </div>
                                </div>

                                {/* Grid Mock */}
                                <div className="p-6 grid grid-cols-12 gap-4 h-full">
                                    {/* Sidebar */}
                                    <div className="col-span-2 hidden md:flex flex-col gap-4 border-r border-white/5 pr-4 h-full">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-8 md:w-full bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                                        ))}
                                    </div>

                                    {/* Main Content */}
                                    <div className="col-span-10 grid grid-cols-2 gap-4">
                                        {/* Chart Card */}
                                        <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase">Revenue Protected</div>
                                                    <div className="text-2xl font-bold text-white">$124,592.00</div>
                                                </div>
                                                <BarChart3 className="text-brand-blue" size={20} />
                                            </div>
                                            {/* Fake Graph Line */}
                                            <div className="h-16 w-full flex items-end gap-1">
                                                {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 100].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-gradient-to-t from-brand-blue/50 to-brand-cyan/50 rounded-t-sm hover:opacity-100 opacity-60 transition-opacity" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Small Cards */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center gap-1 min-h-[100px]">
                                            <Shield size={20} className="text-brand-cyan mb-1" />
                                            <div className="text-center w-full">
                                                <div className="text-lg font-bold text-white leading-tight">99.9%</div>
                                                <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">Security Score</div>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center gap-1 relative overflow-hidden min-h-[100px]">
                                            <div className="absolute inset-0 bg-brand-emerald/10 animate-pulse-slow"></div>
                                            <CheckCircle size={20} className="text-brand-emerald relative z-10 mb-1" />
                                            <div className="text-center relative z-10 w-full">
                                                <div className="text-lg font-bold text-white leading-tight">Verified</div>
                                                <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-1">Identity Status</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decoration Elements */}
                            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-brand-blue/30 rounded-full blur-[50px]"></div>
                            <div className="absolute top-1/2 -left-16 bg-[#1a1a1a] p-4 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4 animate-float">
                                <div className="p-2 bg-brand-rose/20 rounded-lg text-brand-rose"><AlertTriangle size={20} /></div>
                                <div>
                                    <div className="text-xs font-bold text-white uppercase">Threat Blocked</div>
                                    <div className="text-[10px] text-gray-400">IP 192.168.x.x • Screen Recording</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SplitReveal>

                <SplitReveal direction="right" width="100%">
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-brand-rose/10 border border-brand-rose/20 w-fit">
                            <Activity size={14} className="text-brand-rose animate-pulse" />
                            <span className="text-xs font-semibold text-brand-rose uppercase tracking-wider">Live Monitoring</span>
                        </div>
                        <GlowingHeader
                            title="Real-Time Threat Intelligence"
                            subtitle="Our autonomous system monitors user behavior in real-time. Attempts to screen record, take screenshots, or inject malicious code are instantly blocked and logged."
                            className="text-left mb-8"
                        />
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <div className="p-2 bg-brand-blue/20 rounded-lg text-brand-blue"><Eye size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Behavioral Analysis</h4>
                                    <p className="text-sm text-gray-400">Detects non-human mouse movements and scraping.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <div className="p-2 bg-brand-rose/20 rounded-lg text-brand-rose"><Lock size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Instant Lockout</h4>
                                    <p className="text-sm text-gray-400">Automatically bans IPs that attempt unauthorized access.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SplitReveal>
            </div>
        </section>
    );
};

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 z-50 p-3 rounded-full bg-brand-cyan text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-brand-cyan/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} className="group-hover:animate-bounce" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

// --- Main Page ---

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-brand-black text-white selection:bg-brand-blue/30 selection:text-white overflow-hidden font-sans">
            <Navbar />
            <Hero />
            <ProblemSection />
            <SolutionOverview />
            <DRMShowcase />
            <IPFSProofShowcase />
            <SecureMeetShowcase />
            <WalletShowcase />


            {/* AI Website Section */}
            <section className="py-32 bg-brand-dark relative border-t border-white/5">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <GlowingHeader
                            title="AI-Resistant Websites"
                            subtitle="Stop AI bots from scraping your startup ideas and landing pages."
                            className="text-left"
                        />
                        <div className="space-y-8">
                            <div className="flex gap-6 group">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 h-fit group-hover:bg-white/10 transition-colors"><Server size={24} className="text-gray-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">Bot Deception</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">Serves fake "Server Busy" or scrambled content to non-human visitors, poisoning their data training sets.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 h-fit group-hover:bg-white/10 transition-colors"><EyeOff size={24} className="text-gray-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">Cipher-Text Rendering</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">Content is encrypted and only decrypted in a trusted browser context, invisible to headless scrapers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-brand-navy border border-white/10 rounded-3xl p-3 relative shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-700 ease-out group">
                        {/* Visual comparison */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono h-[300px]">
                            <div className="bg-white text-black p-6 rounded-2xl overflow-hidden relative">
                                <div className="font-bold mb-4 text-brand-blue uppercase tracking-wider text-[10px]">HUMAN VIEW</div>
                                <h1 className="text-2xl font-bold mb-4">My Startup</h1>
                                <p className="text-gray-600 mb-4 leading-relaxed">Revolutionary AI tool that helps you...</p>
                                <div className="w-full h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="bg-black text-green-500 p-6 rounded-2xl overflow-hidden relative font-mono text-[10px] leading-relaxed">
                                <div className="font-bold mb-4 text-brand-rose uppercase tracking-wider">BOT VIEW</div>
                                <div className="opacity-50 break-all">
                                    0x83F29 10101010 %^&* NO ACCESS ... ERRROR 403 ... FAKE DATA INJECTION ... SYSTM HALT ...
                                    <br /><br />
                                    [WARN] UNTRUSTED USER AGENT
                                    [BLOCK] IP 45.32.11.22
                                </div>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <div className="text-brand-rose border-2 border-brand-rose px-4 py-2 rotate-[-12deg] font-bold text-xl rounded-lg shadow-[0_0_20px_rgba(244,63,94,0.5)]">ACCESS DENIED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LiveThreatMonitor />

            {/* CTA Section */}
            <section className="py-40 bg-gradient-to-b from-brand-black to-brand-navy relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/20 via-brand-black to-brand-black opacity-50"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <GlowingHeader
                        title="Ready to Secure Your Work?"
                        subtitle="Join thousands of creators, freelancers, and agencies who trust TrustVaultX."
                    />
                    <Link href="/auth/signup" className="inline-block px-12 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        Get Started Free
                    </Link>
                </div>
            </section>

            <FeatureCapsuleGrid />

            <Footer />
            <ScrollToTop />
            <Chatbot />
        </main>
    );
}
