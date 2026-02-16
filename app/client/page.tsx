"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Eye, Wallet, ShoppingBag, Search } from 'lucide-react';
import ClientDashboard from '../_components/ClientDashboard';
import CreatorWallet from '../_components/CreatorWallet';
import { db } from '../../lib/secure-storage';
import GlobalNavbar from '../_components/GlobalNavbar';

export default function ClientMarketplacePage() {
    const [activeView, setActiveView] = useState<'marketplace' | 'wallet'>('marketplace');
    const [walletBalance, setWalletBalance] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

    // Sync wallet balance from DB
    useEffect(() => {
        const loadBalance = async () => {
            const balance = await db.getBalance();
            setWalletBalance(balance);
        };
        loadBalance();

        // Subscribe to DB updates
        const unsubscribe = db.subscribe(loadBalance);
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
            <GlobalNavbar />
            {/* Client Header with Navbar */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center justify-between px-6 z-20 flex-shrink-0">
                {/* Status Indicator instead of redundant logo */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-normal text-green-400 border border-green-500/30 px-3 py-1 rounded-full bg-green-500/5">
                        SECURE CLIENT ACCESS
                    </span>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                    <button
                        onClick={() => setActiveView('marketplace')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'marketplace'
                            ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Marketplace
                    </button>
                    <button
                        onClick={() => setActiveView('wallet')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'wallet'
                            ? 'bg-green-500/20 text-green-400 shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Wallet
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mx-4 hidden md:block w-64">
                    <input
                        type="text"
                        placeholder="Enter ID"
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Wallet Balance Badge & Profile */}
                <div className="flex items-center gap-4 relative">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                        <Wallet className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">${walletBalance.toLocaleString()}</span>
                    </div>

                    {/* Profile Avatar with Popup */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/10 hover:ring-2 hover:ring-white/20 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
                        />

                        {/* Profile Popup */}
                        {showProfile && (
                            <div className="absolute right-0 top-full mt-4 w-64 bg-[#111] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/10" />
                                    <div>
                                        <h3 className="font-bold text-white">Client User</h3>
                                        <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">Verified</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 mb-1">Secure ID</div>
                                        <div className="font-mono text-sm text-cyan-400 flex items-center justify-between">
                                            ab535e32
                                            <button
                                                className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText('ab535e32');
                                                    alert('ID Copied!');
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Backdrop to close */}
                        {showProfile && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                        )}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeView === 'marketplace' && <ClientDashboard />}
                {activeView === 'wallet' && <CreatorWallet isAddMoneyOpen={isAddMoneyOpen} onToggleAddMoney={setIsAddMoneyOpen} />}
            </div>
        </div>
    );
}
