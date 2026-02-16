"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export default function FloatingInput({ label, id, ...props }: FloatingInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative group mb-6">
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
                    w-full px-4 py-4 bg-white/[0.03] border rounded-xl outline-none text-white placeholder-transparent transition-all duration-300
                    ${isFocused ? 'border-brand-cyan/50 shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)]' : 'border-white/10 hover:border-white/20'}
                `}
                placeholder={label}
            />

            {/* Floating Label */}
            <label
                htmlFor={id}
                className={`
                    absolute left-4 pointer-events-none transition-all duration-300 ease-out
                    ${isFocused || hasValue
                        ? 'top-[-10px] text-[11px] bg-[#070b1d] px-2 text-brand-cyan font-semibold tracking-wide'
                        : 'top-4 text-sm text-slate-500 group-hover:text-slate-400'}
                `}
            >
                {label}
            </label>

            {/* Focus Light Sweep Animation */}
            {isFocused && (
                <motion.div
                    layoutId="input-glow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-50" />
                </motion.div>
            )}
        </div>
    );
}
