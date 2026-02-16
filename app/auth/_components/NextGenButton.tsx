"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NextGenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
}

export default function NextGenButton({ children, isLoading, className = "", ...props }: NextGenButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative w-full py-4 rounded-xl overflow-hidden font-bold tracking-wide text-white shadow-lg
                bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-blue bg-[length:200%_100%] animate-[shimmer_3s_infinite]
                disabled:opacity-70 disabled:grayscale
                ${className}
            `}
            disabled={isLoading}
            {...props}
        >
            {/* Inner Highlight (Glass-like top) */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                    </>
                ) : (
                    children
                )}
            </div>

            {/* Glow backing (only visible on dark layers, adds punch) */}
            <div className="absolute inset-0 bg-brand-cyan/20 mix-blend-overlay" />
        </motion.button>
    );
}
