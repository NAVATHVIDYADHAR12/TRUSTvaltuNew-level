"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export interface TypewriterTextProps {
    texts: string[];
    className?: string;
    typingSpeed?: number;
    pauseDuration?: number;
}

export function TypewriterText({
    texts,
    className = "",
    typingSpeed = 50,
    pauseDuration = 3000,
}: TypewriterTextProps) {
    const [index, setIndex] = useState(0);
    const baseText = useMotionValue("");
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) =>
        baseText.get().slice(0, latest)
    );
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const textToType = texts[index];
        baseText.set(textToType);

        const controls = animate(count, textToType.length, {
            type: "tween",
            duration: textToType.length * (typingSpeed / 1000), // convert ms to seconds
            ease: "linear",
            onComplete: () => {
                setIsComplete(true);
                setTimeout(() => {
                    setIsComplete(false);
                    // Animate out (untype) or just switch?
                    // User said "switch between this message as like written animation" -> usually untyping or fading out.
                    // Untyping
                    animate(count, 0, {
                        type: "tween",
                        duration: textToType.length * (typingSpeed / 2000), // faster untypting
                        ease: "easeIn",
                        onComplete: () => {
                            setIndex((prev) => (prev + 1) % texts.length);
                        }
                    });
                }, pauseDuration);
            },
        });

        return controls.stop;
    }, [index, texts, typingSpeed, pauseDuration]);

    return (
        <span className={className}>
            <motion.span>{displayText}</motion.span>
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-[2px] h-[1em] bg-brand-cyan ml-1 align-middle"
            />
        </span>
    );
}
