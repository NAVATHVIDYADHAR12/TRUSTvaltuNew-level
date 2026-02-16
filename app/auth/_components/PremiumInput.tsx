"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export default function PremiumInput({ label, id, ...props }: PremiumInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative group mb-5">
            <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] transition-colors duration-300 hover:bg-white/[0.05]">
                {/* Input Field */}
                <input
                    id={id}
                    {...props}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        setHasValue(!!e.target.value);
                        props.onBlur?.(e);
                    }}
                    onChange={(e) => {
                        setHasValue(!!e.target.value);
                        props.onChange?.(e);
                    }}
                    className={`
                        w-full px-5 pt-7 pb-3 bg-transparent border-0 outline-none text-white text-[15px] font-medium transition-all duration-300 z-10 relative
                        placeholder-transparent
                    `}
                    placeholder={label}
                />

                {/* Floating Label */}
                <label
                    htmlFor={id}
                    className={`
                        absolute left-5 transition-all duration-300 ease-out pointer-events-none z-10
                        ${isFocused || hasValue
                            ? 'top-[10px] text-[10px] font-bold uppercase tracking-wider text-brand-cyan/80'
                            : 'top-[18px] text-[14px] text-slate-400 font-medium'}
                    `}
                >
                    {label}
                </label>

                {/* Focus Border & Light Sweep */}
                <div className={`absolute inset-0 border border-white/10 rounded-2xl pointer-events-none transition-colors duration-300 ${isFocused ? 'border-brand-cyan/30' : ''}`} />

                {/* Animated Bottom Highlight Line for Focus */}
                {isFocused && (
                    <motion.div
                        layoutId="input-highlight"
                        initial={{ opacity: 0, scaleX: 0.8 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-60"
                        transition={{ duration: 0.4 }}
                    />
                )}
            </div>

            {/* Cursor Proximity Glow (Subtle backing) */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/10 to-brand-cyan/0 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        </div>
    );
}
