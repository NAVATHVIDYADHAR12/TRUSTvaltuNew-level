"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface PinterestAuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export default function PinterestAuthLayout({ children, title, subtitle }: PinterestAuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center relative text-[#333333] font-sans selection:bg-[#E60023]/20 selection:text-[#E60023]">
            {/* Blurred Background Image */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: 'url(/qai.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(20px)',
                }}
            />
            {/* Semi-transparent overlay for better content readability */}
            <div className="absolute inset-0 -z-10 bg-white/40 backdrop-blur-sm" />
            {/* Top Navigation / Logo */}
            <div className="w-full flex justify-between items-center px-4 py-4 md:px-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[#E60023] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        TVX
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white drop-shadow-lg hidden sm:block">TrustVaultX</span>
                </Link>
                <div className="text-sm font-medium flex items-center gap-4 text-white drop-shadow-md">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span className="text-white/60">|</span>
                    <Link href="/auth/signin" className="hover:underline">Login</Link>
                    <span className="text-white/60">|</span>
                    <Link href="/auth/signup" className="hover:underline">Sign Up</Link>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-4 pb-12">
                {/* Glass Box Container with Video Background */}
                <div className="relative w-full max-w-[550px] rounded-3xl overflow-hidden">
                    {/* Video Background - Contained within glass box */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/gg2.mp4" type="video/mp4" />
                    </video>

                    {/* Glass Effect Overlay */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20"></div>

                    {/* Content Container - Above video and glass effect */}
                    <div className="relative z-10 w-full text-center px-8 py-12">
                        {/* Logo Large */}
                        <div className="w-12 h-12 bg-[#E60023] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg">
                            TVX
                        </div>

                        <h1 className="text-[32px] font-bold tracking-tight mb-3 text-white drop-shadow-lg">{title}</h1>
                        <p className="text-white text-base mb-8 drop-shadow-md">{subtitle}</p>

                        {/* Form Content */}
                        {children}

                        <div className="mt-8 text-xs text-white max-w-xs mx-auto leading-relaxed drop-shadow-md">
                            By continuing, you agree to TrustVaultX's <a href="#" className="font-bold hover:underline text-white">Terms of Service</a> and acknowledge you've read our <a href="#" className="font-bold hover:underline text-white">Privacy Policy</a>.
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="w-full py-4 text-center text-xs text-[#767676] bg-[#fafafa]">
                Protected by reCAPTCHA and subject to the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.
            </div>
        </div>
    );
}
