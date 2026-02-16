"use client";

import { useState } from "react";

interface GlowingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export default function GlowingInput({ label, id, ...props }: GlowingInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative group mb-8">
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
                    props.onBlur?.(e);
                }}
                className={`
                    peer w-full px-0 py-3 bg-transparent border-b-2 outline-none text-white text-lg font-sans transition-all duration-300
                    placeholder-transparent
                    ${isFocused
                        ? 'border-brand-cyan shadow-[0_10px_20px_-10px_rgba(6,182,212,0.3)]'
                        : 'border-white/10 hover:border-white/30'}
                `}
                placeholder={label}
                // Fix for autofill background
                style={{
                    WebkitBoxShadow: '0 0 0px 1000px #050505 inset',
                    WebkitTextFillColor: 'white',
                    caretColor: '#06b6d4'
                }}
            />

            {/* Floating Label - CSS Only (Robust) */}
            <label
                htmlFor={id}
                className={`
                    absolute left-0 transition-all duration-300 ease-out font-medium tracking-wide pointer-events-none
                    text-slate-500
                    
                    /* Default Position (Placeholder) */
                    top-3 text-base

                    /* Active/Filled State using :peer pseudo-classes */
                    peer-focus:top-[-20px] peer-focus:text-xs peer-focus:text-brand-cyan
                    peer-[:not(:placeholder-shown)]:top-[-20px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-brand-cyan
                `}
            >
                {label}
            </label>

            {/* Dynamic Glow Line (Active State) */}
            <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-orange w-full transform origin-left transition-transform duration-500 scale-x-0 peer-focus:scale-x-100`} />
        </div>
    );
}
