"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SlidingTextProps {
    texts: string[];
    className?: string;
    slideDuration?: number; // Duration of the slide in/out
    pauseDuration?: number; // How long to stay visible
}

export function SlidingText({
    texts,
    className = "",
    slideDuration = 1.5,
    pauseDuration = 3000,
}: SlidingTextProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, slideDuration * 2000 + pauseDuration); 

        return () => clearInterval(timer);
    }, [texts.length, slideDuration, pauseDuration]);

    return (
        <div className={`relative overflow-hidden inline-block align-top ${className}`}>
             <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ width: "0%" }}
                    animate={{ 
                        width: "100%",
                        transition: { duration: slideDuration, ease: "easeInOut" }
                    }}
                    exit={{ 
                         width: "0%",
                         transition: { duration: slideDuration, ease: "easeInOut" } 
                    }}
                     style={{ 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        display: "inline-block",
                        verticalAlign: "top"
                    }}
                >
                    {texts[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Updated V2 with clip-path for multiline support
export function SlidingTextV2({
    texts,
    className = "",
    slideDuration = 1.2, // seconds
    pauseDuration = 3000, // ms
}: SlidingTextProps) {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isVisible) {
             // It's expanding now. Wait for (SlideTime + PauseTime) then trigger retract.
             const timeout = setTimeout(() => {
                 setIsVisible(false);
             }, (slideDuration * 1000) + pauseDuration);
             return () => clearTimeout(timeout);
        } else {
            // It's retracting now. Wait for (SlideTime) then switch text and trigger expand.
             const timeout = setTimeout(() => {
                 setIndex((prev) => (prev + 1) % texts.length);
                 setIsVisible(true);
             }, slideDuration * 1000);
             return () => clearTimeout(timeout);
        }
    }, [isVisible, index, slideDuration, pauseDuration, texts.length]);

    return (
        <div className={`${className} block`}>
            {/* 
               We animate a clip-path to reveal/hide text.
               This allows the text to wrap naturally (multiline) without layout shifts during animation.
            */}
            <motion.div
                key={index}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: isVisible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                transition={{ duration: slideDuration, ease: "easeInOut" }}
                style={{ 
                    whiteSpace: "normal", // Allow wrapping
                    wordWrap: "break-word"
                }}
            >
                {texts[index]}
            </motion.div>
        </div>
    );
}
