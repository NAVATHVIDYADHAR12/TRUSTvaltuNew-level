'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SplitRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    direction?: "left" | "right";
    delay?: number;
    className?: string;
}

export const SplitReveal = ({
    children,
    width = "fit-content",
    direction = "left",
    delay = 0,
    className = ""
}: SplitRevealProps) => {

    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -40 : 40,
            scale: direction === "right" ? 0.95 : 1 // Scale effect for image (right)
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1
        }
    };

    return (
        <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
            <motion.div
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    duration: 0.6, // User requested 600ms
                    ease: [0.25, 0.46, 0.45, 0.94], // Premium Cubic Bezier Ease
                    delay: delay
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
