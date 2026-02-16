"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PinterestAuthLayout from "../_components/PinterestLayout";
import PinterestInput from "../_components/PinterestInput";
import PinterestButton from "../_components/PinterestButton";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: 'client' }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/auth/signin");
            } else {
                setError(data.message || "Signup failed");
                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setError("Connection failed.");
        }
    };

    return (
        <PinterestAuthLayout title="Sign up to find more" subtitle="Join the secure creative network">
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-[#E60023] text-sm font-bold rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-[400px] mx-auto space-y-2">
                <PinterestInput
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <PinterestInput
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <PinterestInput
                    id="age"
                    type="text"
                    label="Age"
                    // Mock field for visual parity with Pinterest prompt if desired, or can handle DOB
                    required
                />

                <div className="mt-4 pb-2">
                    <PinterestButton type="submit" isLoading={isLoading}>
                        Continue
                    </PinterestButton>
                </div>

                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/30"></div>
                    </div>
                    <span className="relative bg-transparent px-2 text-sm font-bold text-white drop-shadow-md">OR</span>
                </div>

                <div className="space-y-3">
                    <PinterestButton type="button" variant="social" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.276c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.234 24 18.266 24 12.276z" fill="#1877F2" /></svg>}>
                        Continue with Facebook
                    </PinterestButton>
                    <PinterestButton type="button" variant="social" icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 22.6 12 22 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.07 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>}>
                        Continue with Google
                    </PinterestButton>
                </div>

                <div className="text-center mt-6 text-sm font-medium text-white drop-shadow-md">
                    Already a member? <Link href="/auth/signin" className="text-white hover:underline font-bold">Log in</Link>
                </div>
            </form>
        </PinterestAuthLayout>
    );
}
