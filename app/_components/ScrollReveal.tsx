'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    className?: string;
}

export const ScrollReveal = ({ children, width = "fit-content", delay = 0, className = "" }: ScrollRevealProps) => {
    return (
        <div style={{ position: "relative", width, overflow: "hidden" }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }} // Trigger when 100px into view
                transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94], // Premium Cubic Bezier Ease
                    delay: delay
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
