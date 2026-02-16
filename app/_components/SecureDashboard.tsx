import React, { useState } from 'react';
import { Shield, Upload, Eye, Settings, LogOut, Lock, Download, AlertTriangle, MessageSquare, ArrowLeft, ArrowRight, History, Wallet, Search, Plus, Globe, Bot, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ClientDashboard from './ClientDashboard';
import AgencyAnalytics from './AgencyAnalytics';
import CreatorWallet from './CreatorWallet';
import SecureViewer from './SecureViewer';
import GlobalNavbar from './GlobalNavbar';

interface SecureDashboardProps {
    agencyId: string;
    children?: React.ReactNode; // Content to display in the main area
    activeTab: 'studio' | 'viewer' | 'settings' | 'analytics' | 'files' | 'wallet';
    onTabChange: (tab: 'studio' | 'viewer' | 'settings' | 'analytics' | 'files' | 'wallet') => void;
    isClientMode: boolean; // Toggle for demo purposes
    onToggleMode: () => void;
}

const SecureDashboard: React.FC<SecureDashboardProps> = ({
    agencyId,
    children,
    activeTab,
    onTabChange,
    isClientMode,
    onToggleMode
}) => {
    const [showProfile, setShowProfile] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);

    const [clientView, setClientView] = useState<'dashboard' | 'wallet'>('dashboard');
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

    // If in Client Mode, render the dedicated Client Dashboard completely
    // If in Client Mode, render the dedicated Client Dashboard with Sidebar
    if (isClientMode) {
        return (
            <div className="flex flex-col h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
                <GlobalNavbar />
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Collapsible Sidebar */}
                    <motion.div
                        initial={{ width: 70 }}
                        animate={{ width: showProfile ? 280 : 70 }}
                        className="border-r border-white/5 flex flex-col justify-between transition-all duration-300 relative group shadow-2xl"
                        style={{ backgroundColor: '#111', zIndex: 60 }}
                        onMouseEnter={() => setShowProfile(true)}
                        onMouseLeave={() => setShowProfile(false)}
                    >
                        {/* Toggle Button (Mobile/Manual) */}
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="absolute -right-3 top-6 bg-cyan-500 text-white p-1 rounded-full shadow-lg border border-white/20 z-50 hover:bg-cyan-600"
                        >
                            {showProfile ? <ArrowLeft className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                        </button>

                        <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto no-scrollbar">
                            {/* 1. Live Session (Home) */}
                            <div className={`flex items-center gap-3 px-2 ${!showProfile && 'justify-center'}`}>
                                <Link href="/" className="flex items-center gap-3 group/link">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    {showProfile && (
                                        <div>
                                            <h3 className="font-bold text-sm text-white group-hover/link:text-cyan-400 transition-colors">LIVE SESSION</h3>
                                            <p className="text-[10px] text-gray-500">Return to Home</p>
                                        </div>
                                    )}
                                </Link>
                            </div>

                            <div className="h-px bg-white/5 mx-2" />

                            {/* 2. Watermark Studio */}
                            <Link
                                href="/connect/creator"
                                className={`flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors ${!showProfile && 'justify-center'}`}
                                title="To Watermark Studio"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                {showProfile && <span className="text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors">Watermark Studio</span>}
                            </Link>

                            {/* 3. Client View (Dashboard) */}
                            <button
                                onClick={() => setClientView('dashboard')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Client View"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${clientView === 'dashboard' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-blue-500/10 group-hover:text-blue-400'}`}>
                                    <Eye className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${clientView === 'dashboard' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`}>Client View</span>}
                            </button>

                            {/* 4. Wallet */}
                            <button
                                onClick={() => setClientView('wallet')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Wallet"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${clientView === 'wallet' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-green-500/10 group-hover:text-green-400'}`}>
                                    <Wallet className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${clientView === 'wallet' ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'} transition-colors`}>Wallet</span>}
                            </button>

                            {/* 5. Add Money */}
                            <button
                                onClick={() => { setClientView('wallet'); setTimeout(() => setIsAddMoneyOpen(true), 100); }}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-colors ${!showProfile && 'justify-center'} group`}
                                title="Add Money"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-green-500/10 group-hover:text-green-400 transition-all border border-transparent group-hover:border-green-500/20">
                                    <Plus className="w-6 h-6" />
                                </div>
                                {showProfile && <span className="text-sm font-medium text-gray-400 group-hover:text-green-400 transition-colors">Add Money</span>}
                            </button>

                            <div className="h-px bg-white/5 mx-2" />

                            {/* 6. Enter ID (Input) */}
                            {showProfile ? (
                                <div className="px-2">
                                    <div className="relative group/search">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-cyan-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Enter ID"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-gray-600 transition-all"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center p-3">
                                    <Search className="w-5 h-5 text-gray-500" />
                                </div>
                            )}

                            {/* 7. Creator View */}
                            <button
                                onClick={onToggleMode}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-colors ${!showProfile && 'justify-center'} group`}
                                title="Switch to Creator View"
                            >
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20">
                                    <Shield className="w-6 h-6" />
                                </div>
                                {showProfile && <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Creator View</span>}
                            </button>
                        </div>

                        {/* 8. Client Session Encrypted status */}
                        <div className={`p-4 border-t border-white/5 bg-[#0a0a0f] ${!showProfile && 'flex justify-center'}`}>
                            {showProfile ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <div>
                                        <p className="text-xs font-bold text-white">Client Session</p>
                                        <p className="text-[10px] text-green-500 font-mono">Encrypted</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Session Encrypted" />
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {clientView === 'dashboard' ? <ClientDashboard /> : (
                            <div className="p-6 h-full overflow-y-auto">
                                <div className="h-full bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                                    <CreatorWallet isAddMoneyOpen={isAddMoneyOpen} onToggleAddMoney={setIsAddMoneyOpen} />
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div >
        );
    }

    // Default: Agency Admin Layout
    return (
        <div className="flex flex-col h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden selection:bg-cyan-500/30">
            <GlobalNavbar />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Collapsible Sidebar - Left */}
                {/* Collapsible Sidebar - Left */}
                <motion.div
                    initial={{ width: 70 }}
                    animate={{ width: showProfile ? 280 : 70 }}
                    className="border-r border-white/5 flex flex-col justify-between transition-all duration-300 relative group shadow-2xl"
                    style={{ backgroundColor: '#111', zIndex: 60 }}
                    onMouseEnter={() => setShowProfile(true)}
                    onMouseLeave={() => setShowProfile(false)}
                >
                    <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto no-scrollbar">
                        {/* 1. Live Session (Home) */}
                        <div className={`flex items-center gap-3 px-2 ${!showProfile && 'justify-center'}`}>
                            <Link href="/" className="flex items-center gap-3 group/link">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <Globe className="w-6 h-6" />
                                </div>
                                {showProfile && (
                                    <div>
                                        <h3 className="font-bold text-sm text-white group-hover/link:text-cyan-400 transition-colors">CREATOR VIEW</h3>
                                        <p className="text-[10px] text-gray-500">Return to Home</p>
                                    </div>
                                )}
                            </Link>
                        </div>

                        <div className="h-px bg-white/5 mx-2" />

                        <div className="space-y-2">
                            {/* Watermark Studio */}
                            <button
                                onClick={() => onTabChange('studio')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Watermark Studio"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'studio'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-purple-500/10 group-hover:text-purple-400'
                                    }`}>
                                    <Upload className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'studio' ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'} transition-colors`}>Watermark Studio</span>}
                            </button>

                            {/* My Files */}
                            <button
                                onClick={() => onTabChange('files')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="My Files"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'files'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-blue-500/10 group-hover:text-blue-400'
                                    }`}>
                                    <History className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'files' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`}>My Files</span>}
                            </button>

                            {/* Secure Viewer */}
                            <button
                                onClick={() => onTabChange('viewer')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Secure Viewer"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'viewer'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-indigo-500/10 group-hover:text-indigo-400'
                                    }`}>
                                    <Eye className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'viewer' ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400'} transition-colors`}>Secure Viewer</span>}
                            </button>

                            {/* DRM Settings */}
                            <button
                                onClick={() => onTabChange('settings')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="DRM Settings"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'settings'
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-orange-500/10 group-hover:text-orange-400'
                                    }`}>
                                    <Settings className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'settings' ? 'text-orange-400' : 'text-gray-400 group-hover:text-orange-400'} transition-colors`}>DRM Settings</span>}
                            </button>

                            {/* Analytics */}
                            <button
                                onClick={() => onTabChange('analytics')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Analytics"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'analytics'
                                    ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-pink-500/10 group-hover:text-pink-400'
                                    }`}>
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'analytics' ? 'text-pink-400' : 'text-gray-400 group-hover:text-pink-400'} transition-colors`}>Analytics</span>}
                            </button>

                            {/* Wallet */}
                            <button
                                onClick={() => onTabChange('wallet')}
                                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all ${!showProfile && 'justify-center'} group`}
                                title="Wallet"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'wallet'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-white/5 text-gray-400 border-transparent group-hover:bg-green-500/10 group-hover:text-green-400'
                                    }`}>
                                    <Wallet className="w-6 h-6" />
                                </div>
                                {showProfile && <span className={`text-sm font-medium ${activeTab === 'wallet' ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'} transition-colors`}>Wallet</span>}
                            </button>
                        </div>

                        {/* Search / Enter ID */}
                        <div className={`px-2 ${!showProfile && 'flex justify-center'}`}>
                            {showProfile ? (
                                <div className="relative group/search">
                                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within/search:text-cyan-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search / Enter ID"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            ) : (
                                <button
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                                    title="Search"
                                    onClick={() => setShowProfile(true)}
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="h-px bg-white/5 mx-2" />

                        {/* Agency ID Status */}
                        {showProfile && (
                            <div className="px-2">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Agency ID</div>
                                    <div className="font-mono text-xs text-gray-300 flex items-center justify-between">
                                        <span className="truncate w-24">{agencyId}</span>
                                        <button
                                            className="text-[10px] bg-white/10 border border-white/5 hover:bg-white/20 px-2 py-0.5 rounded transition-colors text-gray-400 hover:text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(agencyId);
                                                alert('Agency ID Copied!');
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Switch Mode */}
                        <button
                            onClick={onToggleMode}
                            className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-colors ${!showProfile && 'justify-center'} group`}
                            title="Switch to Client View"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            {showProfile && <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Client View Demo</span>}
                        </button>

                        <Link
                            href="/auth/signin"
                            className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-colors ${!showProfile && 'justify-center'} group`}
                            title="Disconnect"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/20">
                                <LogOut className="w-6 h-6" />
                            </div>
                            {showProfile && <span className="text-sm font-medium text-gray-400 group-hover:text-red-400 transition-colors">Disconnect</span>}
                        </Link>
                    </div>

                    {/* Connection Status */}
                    <div className={`p-4 border-t border-white/5 bg-[#0a0a0f] ${!showProfile && 'flex justify-center'}`}>
                        {showProfile ? (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <div>
                                    <p className="text-xs font-bold text-white">Secure Session</p>
                                    <p className="text-[10px] text-green-500 font-mono">Agency Connected</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-green-500" title="Secure Session Active" />
                        )}
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <main className="flex-1 relative overflow-hidden flex flex-col bg-[#0a0a0a]">
                    {/* Simplified Header - Just Title and Spacing */}
                    <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 z-10">
                        <h1 className="text-lg font-bold text-white">
                            {activeTab === 'studio' && 'Watermark Studio'}
                            {activeTab === 'viewer' && 'Secure Content Viewer'}
                            {activeTab === 'files' && 'My File History'}
                            {activeTab === 'settings' && 'DRM Configuration'}
                            {activeTab === 'analytics' && 'Client Insights & Summaries'}
                            {activeTab === 'wallet' && 'Wallet & Transactions'}
                        </h1>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === 'viewer' && <SecureViewer onNavigate={() => onTabChange('studio')} />}
                                {activeTab !== 'viewer' && children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Right Sidebar (Optional - Keep existing for AI/Stats in Agency View) */}
                <motion.div
                    initial={{ width: 70 }}
                    animate={{ width: showRightPanel ? 320 : 70 }}
                    className="bg-[#111] border-l border-white/5 hidden xl:flex flex-col z-20 transition-all duration-300 relative group shadow-2xl"
                    onMouseEnter={() => setShowRightPanel(true)}
                    onMouseLeave={() => setShowRightPanel(false)}
                >
                    {/* Toggle Button */}
                    <button
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className="absolute -left-3 top-6 bg-cyan-500 text-white p-1 rounded-full shadow-lg border border-white/20 z-50 hover:bg-cyan-600"
                    >
                        {showRightPanel ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                    </button>

                    {/* AI Agent Section */}
                    <div className="h-1/2 border-b border-white/5 p-4 flex flex-col overflow-hidden">
                        <div className={`flex items-center gap-3 mb-4 ${!showRightPanel && 'justify-center'}`}>
                            {showRightPanel ? (
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">AI Assistant</h3>
                            ) : (
                                <Bot className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                        {showRightPanel ? (
                            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
                                <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                                <div className="text-center p-4">
                                    <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
                                        <Bot className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">"I can help you analyze watermarks or configure DRM."</p>
                                    <p className="text-xs text-gray-600 mt-2">(Interactive in Client View)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
                                <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                                <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                                <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                            </div>
                        )}
                    </div>

                    {/* Stats/Quick Info Section */}
                    <div className="h-1/2 p-4 flex flex-col overflow-hidden">
                        <div className={`flex items-center gap-3 mb-4 ${!showRightPanel && 'justify-center'}`}>
                            {showRightPanel ? (
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Session Stats</h3>
                            ) : (
                                <Activity className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                        {showRightPanel ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                                    <span className="text-sm text-gray-400 whitespace-nowrap">Encryption</span>
                                    <span className="text-sm font-mono text-green-400">AES-256</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                                    <span className="text-sm text-gray-400 whitespace-nowrap">Files</span>
                                    <span className="text-sm font-mono text-white">12</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                                    <span className="text-sm text-gray-400 whitespace-nowrap">Blocked</span>
                                    <span className="text-sm font-mono text-red-400">3</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                <div className="p-2 bg-green-500/10 rounded-lg"><Lock className="w-4 h-4 text-green-500" /></div>
                                <div className="p-2 bg-white/5 rounded-lg"><Upload className="w-4 h-4 text-white" /></div>
                                <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SecureDashboard;
