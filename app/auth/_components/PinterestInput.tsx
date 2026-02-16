"use client";

interface PinterestInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export default function PinterestInput({ label, id, ...props }: PinterestInputProps) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="sr-only">{label}</label>
            <input
                id={id}
                {...props}
                placeholder={label}
                className={`
                    w-full px-5 py-[14px] 
                    bg-white border-2 border-[#cdcdcd] rounded-2xl
                    text-[16px] text-[#111111] placeholder-[#767676] font-medium
                    focus:outline-none focus:border-[#767676] focus:shadow-[0_0_0_4px_rgba(0,132,255,0.15)]
                    hover:border-[#a0a0a0]
                    transition-all duration-200 ease-out
                `}
            />
        </div>
    );
}
