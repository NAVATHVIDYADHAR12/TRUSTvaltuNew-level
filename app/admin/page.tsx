"use client";

import { useSession } from "../../lib/mock-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Shield, Users, Copy, Check, Filter, MoreVertical } from "lucide-react";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

export default function Admin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchUsers();
        }
    }, [status, router]);

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.includes(searchTerm)
    );

    if (status === "loading" || isLoading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Admin Panel...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    router.push('/');
                                }
                            }}
                            className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">TrustVault</span>
                            <span className="text-gray-500 font-medium">|</span>
                            <span className="text-white">Admin Panel</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            System Active
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} className="text-neon-blue" />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
                        <div className="text-3xl font-bold text-white">{users.length}</div>
                        <div className="mt-2 text-xs text-green-400 flex items-center gap-1">Onboarded Clients & Creators</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={64} className="text-neon-purple" />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Active Licenses</h3>
                        <div className="text-3xl font-bold text-white">24</div>
                        <div className="mt-2 text-xs text-neon-blue">Secured Assets</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-6 rounded-2xl border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="text-neon-cyan mb-2">+</div>
                        <div className="text-sm font-bold">Manage Roles</div>
                    </div>
                </div>

                {/* Users Table Section */}
                <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Users size={18} className="text-gray-400" />
                            Registered Users
                        </h2>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Name, or Email..."
                                    className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-neon-blue outline-none placeholder:text-gray-600"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/40 text-gray-500 border-b border-white/5 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Unique ID</th>
                                    <th className="px-6 py-4 font-medium">User Profile</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Joined Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-black border border-white/10 rounded px-2 py-1 text-neon-cyan font-mono text-xs">
                                                    {user.id}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(user.id)}
                                                    className="text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Copy ID"
                                                >
                                                    {copiedId === user.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xs border border-white/10">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-gray-500 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${user.role === 'client'
                                                ? 'bg-blue-900/20 text-blue-400 border-blue-800/30'
                                                : 'bg-purple-900/20 text-purple-400 border-purple-800/30'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-white/10 bg-black/20 text-xs text-gray-500 flex justify-between items-center">
                        <span>Showing {filteredUsers.length} results</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
