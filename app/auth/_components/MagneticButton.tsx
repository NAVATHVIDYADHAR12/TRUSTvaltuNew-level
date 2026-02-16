"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, ReactNode, useRef } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
}

export default function MagneticButton({ children, isLoading, className = "", ...props }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // Magnetic Physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { mass: 0.1, stiffness: 150, damping: 15 });
    const ySpring = useSpring(y, { mass: 0.1, stiffness: 150, damping: 15 });

    const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.3); // Magnetic pull strength
        y.set(distanceY * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative w-full py-5 rounded-none font-bold tracking-[0.2em] uppercase text-black text-sm
                bg-brand-cyan overflow-hidden group
                ${className}
            `}
            disabled={isLoading}
            {...props}
        >
            {/* Liquid Gradient Fill Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glare Effect */}
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[25deg] group-hover:animate-[glare_0.8s_ease-in-out]" />

            <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Initializing...</span>
                    </>
                ) : (
                    children
                )}
            </div>
        </motion.button>
    );
}
