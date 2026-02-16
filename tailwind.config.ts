import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Hyper-Real SaaS Palette
                brand: {
                    black: "#050505",
                    dark: "#0B1120",  // Deep Navy background (matches Shield depth)
                    navy: "#172554",  // Rich Blue-Heavy charcoal
                    surface: "#1E293B",
                    blue: "#2563EB",  // Trust Blue (Royal Blue)
                    violet: "#4F46E5", // Indigo (Replacing bright violet with deep indigo)
                    cyan: "#06B6D4",  // Vault Cyan (Electric Blue/Cyan)
                    emerald: "#10B981",
                    rose: "#F43F5E",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-glow": "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15) 0%, rgba(10, 10, 10, 0) 60%)",
                "glass-gradient": "linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
                "mesh-gradient": "radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(79, 70, 229, 0.15) 0px, transparent 50%)",
            },
            boxShadow: {
                "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                "glass-inset": "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
                "glow": "0 0 20px rgba(37, 99, 235, 0.5)",
                "glow-lg": "0 0 50px rgba(37, 99, 235, 0.3)",
                // Claymorphism: soft, inflated 3D look
                "clay": "inset -8px -8px 16px 0 rgba(0, 0, 0, 0.4), inset 8px 8px 16px 0 rgba(255, 255, 255, 0.1), 10px 10px 20px 0 rgba(0, 0, 0, 0.5)",
                // Skeuomorphism: sharp bevels
                "skeuo": "inset 1px 1px 1px rgba(255, 255, 255, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 5px 5px 10px rgba(0,0,0,0.5), -5px -5px 10px rgba(255,255,255,0.05)",
                "skeuo-pressed": "inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.05)",
            },
            animation: {
                "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "orbit": "orbit 20s linear infinite",
                "shimmer": "shimmer 2s linear infinite",
                "float": "float 6s ease-in-out infinite",
                "float-delayed": "float 6s ease-in-out 3s infinite",
            },
            keyframes: {
                orbit: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                }
            },
        },
    },
    plugins: [],
};
export default config;
