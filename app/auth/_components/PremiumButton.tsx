"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
}

export default function PremiumButton({ children, isLoading, className = "", ...props }: PremiumButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`
                group relative w-full py-[14px] rounded-xl overflow-hidden font-bold text-[15px] tracking-wide text-white shadow-lg
                bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] animate-[shimmer_4s_infinite]
                disabled:opacity-70 disabled:grayscale
                ${className}
            `}
            disabled={isLoading}
            {...props}
        >
            {/* Soft Outer Glow (Layered behind) - CSS handled via parent or shadow utility, here we use shadow-lg */}

            {/* Inner Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : children}
            </span>

            {/* Inner Highlight Streak (Slow Movement) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />

            {/* Top Shine */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/30" />
        </motion.button>
    );
}
