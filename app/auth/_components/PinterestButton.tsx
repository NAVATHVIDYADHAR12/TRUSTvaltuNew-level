"use client";

import { ReactNode } from "react";

interface PinterestButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "social";
    isLoading?: boolean;
    icon?: ReactNode;
}

export default function PinterestButton({ children, variant = "primary", isLoading, icon, className = "", ...props }: PinterestButtonProps) {

    const baseStyles = "w-full py-2.5 px-4 rounded-full font-bold text-[15px] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-[#E60023] text-white hover:bg-[#ad081b] shadow-sm disabled:bg-gray-300 disabled:text-gray-500",
        secondary: "bg-[#efefef] text-[#111111] hover:bg-[#e2e2e2]",
        social: "bg-white border-2 border-[#cdcdcd] text-[#111111] hover:bg-[#f0f0f0] hover:border-[#a0a0a0]"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
