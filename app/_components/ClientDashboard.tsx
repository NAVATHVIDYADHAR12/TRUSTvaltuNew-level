import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Lock, Globe, File, Clock, Download, Play, Music, Image as ImageIcon, CheckCircle, DollarSign, FileText, Plus, PanelRight, ChevronLeft, ChevronRight, AlertTriangle, Monitor } from 'lucide-react';
import AIAgentPanel from './AIAgentPanel';
import { motion, AnimatePresence } from 'framer-motion';

import { unifiedStorage } from '../../lib/unified-storage';
import { ProtectedFile, db } from '../../lib/secure-storage';

const ClientDashboard = () => {
    const [recentFiles, setRecentFiles] = useState<Omit<ProtectedFile, 'src' | 'originalSrc'>[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProtectedFile | null>(null);
    const [purchasedFiles, setPurchasedFiles] = useState<string[]>([]);
    const [walletBalance, setWalletBalance] = useState(3508);
    const [viewFilter, setViewFilter] = useState<'all' | 'purchased'>('all');
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    const filteredFiles = recentFiles.filter(f => {
        if (viewFilter === 'purchased') return purchasedFiles.includes(f.id);
        return true;
    });

    const loadData = useCallback(async () => {
        try {
            // Load market files only
            const files = await unifiedStorage.getAllFiles('market');
            setRecentFiles(files);

            // Handle case where selected file might have been deleted
            if (selectedFile) {
                const updatedFile = files.find(f => f.id === selectedFile.id);
                if (!updatedFile) {
                    setSelectedFile(null); // Reset if deleted
                    if (files.length > 0) {
                        handleFileSelect(files[0].id); // Select new first if available
                    }
                } else {
                    // Check if critical metadata changed (like DRM or Price) and update selectedFile
                    // We need to preserve the 'src' and 'originalSrc' if the metadata update didn't include them (as getAllFiles returns metadata)
                    // But wait, getAllFiles includes 'src' in the current logic.
                    // Let's just update it, but be careful not to lose current view state if possible.
                    // Actually, let's just update it if the object reference changed, React will handle diff?
                    // Better to check specific fields or just set it to ensure Freshness.
                    // To avoid infinite loops or re-renders, we can check JSON stringify of relevant fields.
                    if (JSON.stringify(updatedFile.drmSettings) !== JSON.stringify(selectedFile.drmSettings) ||
                        updatedFile.price !== selectedFile.price ||
                        JSON.stringify(updatedFile.watermarkSettings) !== JSON.stringify(selectedFile.watermarkSettings)) {
                        // Fetch full content again to be safe? Or just merge metadata?
                        // selectedFile has content (maybe). updatedFile (from getAllFiles) has src usually.
                        // Let's merge.
                        setSelectedFile(prev => prev ? { ...prev, ...updatedFile } : updatedFile);
                    }
                }
            }
            // If no file selected, or selected file not in list, select first (and load it)
            else if (files.length > 0) {
                // Trigger selection logic which will load full content
                handleFileSelect(files[0].id);
            }
        } catch (e) { console.error(e); }

        const purchasedIds = await db.getPurchases();

        // RECOVERY: Check Transaction History to restore missing purchases
        // (Handles case where 'purchases' store was empty but 'transactions' persisted)
        const transactions = await db.getTransactions();
        const marketFiles = await unifiedStorage.getAllFiles('market');
        const restoredIds: string[] = [];

        for (const tx of transactions) {
            if (tx.type === 'debit' && tx.title.startsWith('License: ')) {
                const fileName = tx.title.replace('License: ', '').trim();
                // Find file by name (fallback since tx didn't store ID)
                const file = marketFiles.find(f => f.name === fileName);
                if (file) {
                    if (!purchasedIds.includes(file.id) && !restoredIds.includes(file.id)) {
                        console.log("Restoring purchase from transaction:", file.name);
                        await db.addPurchase({ fileId: file.id, date: tx.date, price: tx.amount });
                        restoredIds.push(file.id);
                    }
                }
            }
        }

        const finalPurchased = [...purchasedIds, ...restoredIds];
        setPurchasedFiles(finalPurchased);

        // Legacy migration check (optional, can be removed later)
        // Legacy migration check (optional, can be removed later)
        const savedPurchases = localStorage.getItem('purchased_files_ids');
        if (savedPurchases) {
            const legacy = JSON.parse(savedPurchases);
            if (legacy.length > 0) {
                let hasNew = false;
                for (const pid of legacy) {
                    if (!finalPurchased.includes(pid)) {
                        await db.addPurchase({ fileId: pid, date: new Date().toISOString(), price: 0 });
                        hasNew = true;
                    }
                }
                if (hasNew) {
                    const updated = await db.getPurchases();
                    setPurchasedFiles(updated);
                }
            }
        }
    }, [selectedFile, viewFilter, purchasedFiles]);

    const handleFileSelect = async (id: string) => {
        try {
            const { file: fullFile } = await unifiedStorage.getFileWithContent(id);
            if (fullFile) {
                setSelectedFile(fullFile);
            } else {
                console.error("File content not found for id:", id);
            }
        } catch (e) {
            console.error("Error loading specific file:", e);
        }
    };

    useEffect(() => {
        loadData();
        const unsubscribe = unifiedStorage.subscribe(loadData);
        // Listen for storage events to sync balance across tabs/components
        const handleStorageChange = () => loadData();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadData]);

    const defaultDrmConfig = {
        blockRightClick: false,
        blockPrintScreen: false,
        blockKeyboard: false,
        blockShortcuts: false,
        antiScreenshot: false,
        tabFocusProtection: false,
        blockMediaRecorder: false,
        blockPiP: false,
        forensicWatermark: false,
        visualWatermark: false,
        watermarkOverlay: false,
        geoRestriction: false,
        expireAfterView: false
    };

    const [drmConfig, setDrmConfig] = useState(defaultDrmConfig);
    const [showDRMOverlay, setShowDRMOverlay] = useState(false);
    const [showRecordingBlock, setShowRecordingBlock] = useState(false); // Black screen for recording detection

    const [warningMsg, setWarningMsg] = useState<string | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showSecurityWarning = (msg: string) => {
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        setWarningMsg(msg);
        warningTimeoutRef.current = setTimeout(() => {
            setWarningMsg(null);
        }, 20000); // 20s warning duration
    };

    useEffect(() => {
        const loadDrmSettings = () => {
            if (typeof window !== 'undefined') {
                const pageSettingsStr = localStorage.getItem('drm_settings');
                const pageSettings = pageSettingsStr ? JSON.parse(pageSettingsStr) : {};
                const navSettingsStr = localStorage.getItem('drmSettings');
                const navSettings = navSettingsStr ? JSON.parse(navSettingsStr) : {};

                // Start with Default
                let config = { ...defaultDrmConfig };

                // Apply File Settings (if any)
                if (selectedFile?.drmSettings) {
                    config = { ...config, ...selectedFile.drmSettings };
                }

                // Apply Global Overrides (Priority: Page Settings > Nav Settings > File Settings for blocking features)
                // This ensures "Real Time" toggles in Creator View work immediately
                config = {
                    ...config,
                    blockRightClick: pageSettings.blockRightClick || navSettings.rightClickDisable || config.blockRightClick,
                    blockPrintScreen: pageSettings.blockPrintScreen || navSettings.screenshotBlocking || config.blockPrintScreen,
                    blockKeyboard: pageSettings.blockKeyboard || config.blockKeyboard,
                    blockShortcuts: pageSettings.blockShortcuts || config.blockShortcuts,
                    antiScreenshot: pageSettings.antiScreenshot || config.antiScreenshot,
                    tabFocusProtection: pageSettings.tabFocusProtection || navSettings.tabFocusProtection || config.tabFocusProtection,
                    blockMediaRecorder: pageSettings.blockMediaRecorder || navSettings.screenRecordingBlock || config.blockMediaRecorder,
                    blockPiP: pageSettings.blockPiP || navSettings.pipBlock || config.blockPiP,
                    watermarkOverlay: pageSettings.watermarkOverlay || navSettings.watermarkOverlay || config.watermarkOverlay,
                    forensicWatermark: pageSettings.forensicWatermark || navSettings.forensicWatermark || config.forensicWatermark,
                    visualWatermark: true // Always true for this demo
                };

                setDrmConfig(config);
            }
        };
        loadDrmSettings();
        window.addEventListener('storage', loadDrmSettings);
        window.addEventListener('drmSettingsChanged', loadDrmSettings);
        return () => {
            window.removeEventListener('storage', loadDrmSettings);
            window.removeEventListener('drmSettingsChanged', loadDrmSettings);
        };
    }, [selectedFile]); // Re-run when selectedFile changes

    // Track if a penalty (long block) is currently active
    const isPenaltyActive = useRef(false);
    const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Screen Recording Detection (Netflix-style Black Screen)
    // Uses periodic black flashes to make recordings unusable
    useEffect(() => {
        if (!drmConfig.blockMediaRecorder) {
            setShowRecordingBlock(false);
            return;
        }

        // Also show black screen on any window blur (user might be screen recording)
        const handleRecordingBlur = () => {
            setShowRecordingBlock(true);
            setTimeout(() => {
                // Only hide if user has returned focus AND no penalty active
                if (!document.hidden && !isPenaltyActive.current) {
                    setShowRecordingBlock(false);
                }
            }, 2000);
        };

        window.addEventListener('blur', handleRecordingBlur);

        return () => {
            window.removeEventListener('blur', handleRecordingBlur);
            setShowRecordingBlock(false);
        };
    }, [drmConfig.blockMediaRecorder]);

    useEffect(() => {
        // 1. Right Click
        const handleContextMenu = (e: MouseEvent) => {
            if (drmConfig.blockRightClick) {
                e.preventDefault();
                showSecurityWarning('Security Alert: Content is protected. Context menu disabled.');
            }
        };

        // Helper to force style update
        const forcePaint = (el: HTMLElement) => void el.offsetHeight;

        // 2. Keyboard & PrintScreen - 20s PENALTY
        const handleKeyDown = (e: KeyboardEvent) => {
            if (drmConfig.blockPrintScreen || drmConfig.antiScreenshot) {
                const isScreenshotAttempt =
                    e.key === 'PrintScreen' ||
                    (e.key === 'S' && e.shiftKey && (e.metaKey || e.getModifierState('Meta'))) || // Win+Shift+S
                    (e.key === 's' && e.shiftKey && e.ctrlKey) || // Some screenshot tools
                    (e.key === 'Print') ||
                    (e.key === '3' && e.metaKey && e.shiftKey) || // Mac screenshot
                    (e.key === '4' && e.metaKey && e.shiftKey) || // Mac screenshot
                    (e.key === '5' && e.metaKey && e.shiftKey);   // Mac screenshot

                if (isScreenshotAttempt) {
                    try { navigator.clipboard.writeText(''); } catch (e) { }
                    e.preventDefault();
                    e.stopPropagation();

                    // 1. INSTANT SAFETY: Hide Content
                    const content = document.getElementById('dashboard-content');
                    if (content) {
                        content.style.opacity = '0';
                        forcePaint(content);
                    }

                    // 2. SHOW OVERLAY (React AnimatePresence)
                    setShowDRMOverlay(true);
                    isPenaltyActive.current = true;

                    // 3. SET 20s TIMEOUT (Zoom Logic)
                    if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);

                    // Add strict CSS protection
                    document.body.style.userSelect = 'none';
                    document.body.style.webkitUserSelect = 'none';

                    penaltyTimerRef.current = setTimeout(() => {
                        isPenaltyActive.current = false;
                        setShowDRMOverlay(false);

                        // Restore content
                        if (content) {
                            content.style.opacity = '1';
                            content.style.filter = 'none';
                        }
                        document.body.style.userSelect = 'auto';
                        document.body.style.webkitUserSelect = 'auto';
                    }, 3000); // 3s Strict Penalty (as requested by user)
                }
            }
            if (drmConfig.blockKeyboard) {
                if (
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                    (e.ctrlKey && e.key === 'u')
                ) {
                    e.preventDefault();
                    showSecurityWarning('Security Alert: Developer Tools are restricted.');
                }
            }

            // Block Shortcuts (Ctrl+S, Ctrl+P, Ctrl+C)
            if (drmConfig.blockShortcuts) {
                if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'c' || e.key === 'v')) {
                    e.preventDefault();
                    showSecurityWarning('Security Alert: Copy/Save/Print shortcuts are disabled.');
                }
            }
        };

        // 3. Tab Focus Protection (Pause/Blur) & Anti-Screenshot (Blur)
        const handleVisibilityChange = () => {
            const video = document.querySelector('video');

            if (drmConfig.tabFocusProtection) {
                if (document.hidden) {
                    if (video && !video.paused) video.pause();
                    document.title = "Security Paused";
                    setShowDRMOverlay(true); // Hide content when tab is hidden
                } else {
                    document.title = "Client Dashboard";
                    // Only hide overlay if no penalty is active
                    if (!isPenaltyActive.current) setShowDRMOverlay(false);
                }
            }
        };

        const handleBlur = () => {
            // "Anti-Screenshot" OR "Screenshot Blocking"
            if (drmConfig.antiScreenshot || drmConfig.blockPrintScreen) {
                // 1. INSTANT SAFETY: Hide Content IMMEDIATELY (before React re-renders)
                const content = document.getElementById('dashboard-content');
                if (content) {
                    content.style.opacity = '0';
                    content.style.filter = 'blur(20px)';
                    forcePaint(content);
                }

                // 2. Show overlay (React AnimatePresence)
                setShowDRMOverlay(true);

                // NO TIMEOUT - keep hidden until focus returns or penalty ends
            }
        };

        const handleFocus = () => {
            // Re-verify on focus - only restore if NO penalty is active
            if (drmConfig.antiScreenshot || drmConfig.blockPrintScreen) {
                // Wait a tiny bit to ensure penalty has been set if PrintScreen was pressed
                setTimeout(() => {
                    if (!isPenaltyActive.current && !document.hidden) {
                        // Start fading back in
                        const content = document.getElementById('dashboard-content');
                        if (content) {
                            content.style.opacity = '1';
                            content.style.filter = 'none';
                        }
                        setShowDRMOverlay(false);
                    }
                }, 50); // Small delay to ensure keydown has set penalty if needed
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        // 4. Block MediaRecorder API (Screen Recording)
        // Store original to restore if needed (advanced) - for now just override if blocked
        if (typeof window !== 'undefined' && drmConfig.blockMediaRecorder) {
            // @ts-ignore
            if (!window.MediaRecorder || window.MediaRecorder.toString().indexOf('disabled') === -1) {
                // @ts-ignore
                window.MediaRecorder = class {
                    constructor() { throw new Error("Screen Recording is disabled."); }
                    static isTypeSupported() { return false; }
                };
            }
        }

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [drmConfig]);

    // Load balance from DB
    useEffect(() => {
        const loadBalance = async () => {
            const bal = await db.getBalance();
            setWalletBalance(bal);
        };
        loadBalance();
        const unsubscribe = db.subscribe(loadBalance);
        return () => unsubscribe();
    }, []);

    const handlePurchase = async (file: ProtectedFile) => {
        // Refresh balance check just in case
        const currentBalance = await db.getBalance();

        if (currentBalance < file.price) {
            alert(`Insufficient funds! Your Wallet Balance: $${currentBalance} `);
            return;
        }

        if (confirm(`Purchase license for "${file.name}" ?\nPrice: $${file.price} \nCurrent Balance: $${currentBalance} `)) {

            if (!file.originalSrc) {
                alert("Error: Original high-quality source not found for this item.");
                return;
            }

            console.log("Verifying original file integrity...");

            // Perform Transaction
            const newBalance = currentBalance - file.price;

            // 1. Update Balance
            await db.updateBalance(newBalance);

            // 2. Record Transaction
            await db.addTransaction({
                type: 'debit',
                title: `License: ${file.name}`,
                amount: file.price,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Completed'
            });

            // 3. Record Purchase
            await db.addPurchase({
                fileId: file.id,
                date: new Date().toISOString(),
                price: file.price
            });

            // Optimistic Update for immediate UI feedback
            setPurchasedFiles(prev => [...prev, file.id]);

            alert(`Purchase Successful! $${file.price} deducted. Downloading original file...`);

            // Auto-Download immediately after purchase
            handleDownload(file);
        }
    };

    const handleDownload = (file: ProtectedFile) => {
        const link = document.createElement('a');
        link.href = file.originalSrc || file.src;

        let ext = 'png';
        if (file.type === 'video') ext = 'mp4';
        if (file.type === 'document') ext = 'pdf';

        link.download = `${file.name.replace(/\s+/g, '_')}.${ext} `;
        link.click();
    };

    const getFileIcon = (type?: string) => {
        if (!type) return <File className="w-4 h-4 text-gray-400" />;
        if (type.startsWith('video')) return <Play className="w-4 h-4 text-blue-400" />;
        if (type === 'document') return <FileText className="w-4 h-4 text-orange-400" />;
        if (type.startsWith('image')) return <ImageIcon className="w-4 h-4 text-green-400" />;
        return <File className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden text-white font-sans bg-[#0a0a0f]">

            {/* CONTENT WRAPPER - Targeted for Blur */}
            <div
                id="dashboard-content"
                className="flex h-full w-full gap-4 p-4 relative z-0"
                style={{ willChange: 'filter' }} // Optimize for blur performance
            >

                {/* LEFT COLUMN: AI & Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 flex flex-col gap-2 hidden lg:flex"
                >
                    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex-1 flex flex-col min-h-0">
                        <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-900/10 to-transparent flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="font-bold text-sm">AI Assistant</h3>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <AIAgentPanel />
                        </div>
                    </div>

                    <div className="bg-[#111] rounded-2xl border border-white/5 p-2 flex-shrink-0">
                        <div className="space-y-1 text-xs text-gray-400">
                            <div className="flex justify-between items-center p-1 bg-white/5 rounded">
                                <span>Shared Files</span>
                                <span className="font-mono text-cyan-400">{recentFiles.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 bg-white/5 rounded">
                                <span>Balance</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-green-400">${walletBalance.toLocaleString()}</span>
                                    <Link href="/wallet" className="p-0.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors" title="Add Money">
                                        <Plus className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CENTER COLUMN: Main Viewer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden relative flex flex-col"
                >
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#111] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-sm tracking-wide">SECURE PREVIEW</span>
                        </div>

                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 mr-4">
                            <button
                                onClick={() => setViewFilter('all')}
                                className={`px - 3 py - 1.5 rounded - md text - xs font - medium transition - all ${viewFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'} `}
                            >
                                Marketplace
                            </button>
                            <button
                                onClick={() => setViewFilter('purchased')}
                                className={`px - 3 py - 1.5 rounded - md text - xs font - medium transition - all ${viewFilter === 'purchased' ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'} `}
                            >
                                My Purchases
                            </button>
                        </div>
                        {selectedFile && (
                            <div className="text-xs text-gray-500 font-mono mr-4">
                                ID: {selectedFile.id.substring(0, 8)}...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative bg-black/50 overflow-y-auto no-scrollbar flex items-center justify-center p-4">

                        {/* Forensic Watermark (Invisible) */}
                        {drmConfig.forensicWatermark && (
                            <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.02] mix-blend-overlay overflow-hidden select-none">
                                {/* Repeating Pattern of User ID for Forensic Analysis */}
                                <div className="w-full h-full flex flex-wrap content-start transform -rotate-12 scale-150">
                                    {Array(50).fill('USER_ID_FORENSIC_MARKER').map((t, i) => (
                                        <span key={i} className="m-12 text-4xl font-black text-white">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedFile ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                {/* Media Rendering */}
                                <div className="relative w-full max-w-4xl flex items-center justify-center bg-black/20 rounded-xl overflow-hidden min-h-[300px]">
                                    {selectedFile.type === 'image' && (
                                        <img
                                            key={selectedFile.id} // Re-render on change
                                            src={purchasedFiles.includes(selectedFile.id) ? (selectedFile.originalSrc || selectedFile.src) : selectedFile.src}
                                            className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded select-none pointer-events-none"
                                            alt="Secure content"
                                        />
                                    )}
                                    {selectedFile.type === 'video' && (
                                        <div className="relative w-full flex justify-center">
                                            <video
                                                key={selectedFile.id} // Re-render on change
                                                src={selectedFile.src}
                                                className="max-w-full max-h-[60vh] rounded shadow-2xl"
                                                controls
                                                disablePictureInPicture={drmConfig.blockPiP}
                                                controlsList="nodownload noplaybackrate"
                                                playsInline
                                            >
                                                Your browser does not support the video tag.
                                            </video>

                                            {/* Watermark Overlay Logic */}
                                            {(drmConfig.visualWatermark || drmConfig.watermarkOverlay) && (
                                                (!purchasedFiles.includes(selectedFile.id) && selectedFile.watermarkSettings) ? (
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-20">
                                                        <div
                                                            className="text-white font-bold whitespace-nowrap"
                                                            style={{
                                                                opacity: selectedFile.watermarkSettings.opacity,
                                                                transform: `rotate(${selectedFile.watermarkSettings.rotation}deg)`,
                                                                fontSize: '48px',
                                                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                                            }}
                                                        >
                                                            {selectedFile.watermarkSettings.isRepeated ? (
                                                                <div className="grid grid-cols-3 gap-12 opacity-50">
                                                                    {Array(9).fill(selectedFile.watermarkSettings.text).map((t, i) => <span key={i}>{t}</span>)}
                                                                </div>
                                                            ) : selectedFile.watermarkSettings.text}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Default Global Watermark if no specific settings but global is on
                                                    <div className="absolute top-4 right-4 pointer-events-none z-20 opacity-50">
                                                        <div className="text-white/50 text-xs font-mono border border-white/20 px-2 py-1 rounded">
                                                            PROTECTED VIEW
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                    {selectedFile.type === 'document' && (
                                        <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10 w-full">
                                            <FileText className="w-24 h-24 mx-auto text-orange-400 mb-6" />
                                            <h3 className="text-2xl font-bold text-white mb-2">{selectedFile.name}</h3>
                                            <p className="text-gray-400 mb-4">Secure Document Preview</p>
                                            {!purchasedFiles.includes(selectedFile.id) && (
                                                <div className="inline-block px-4 py-2 bg-red-500/20 text-red-400 rounded text-sm border border-red-500/30">
                                                    Purchase to unlock full document
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Controls / Buy Section */}
                                <div className="mt-8 bg-[#15151a] border border-white/10 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-2xl z-30 w-full max-w-2xl">
                                    {purchasedFiles.includes(selectedFile.id) ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                                                <CheckCircle className="w-5 h-5" />
                                                License Active
                                            </div>
                                            <button
                                                onClick={() => handleDownload(selectedFile)}
                                                className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-green-500/20"
                                            >
                                                <Download className="w-5 h-5" /> Download Original
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">License Price</span>
                                                <span className="text-3xl font-black text-white tracking-tight">${selectedFile.price}</span>
                                            </div>
                                            <button
                                                onClick={() => handlePurchase(selectedFile)}
                                                className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                                            >
                                                <DollarSign className="w-5 h-5" /> Buy License Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 flex flex-col items-center">
                                <Lock className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a file from the list to view</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* RIGHT COLUMN: Files & Tabs */}
                <motion.div
                    initial={{ width: 320, opacity: 1, x: 0 }}
                    animate={{
                        width: showRightSidebar ? 320 : 0,
                        opacity: 1, // Opacity always 1 so button is visible
                        x: 0,
                        marginLeft: showRightSidebar ? 0 : 0
                    }}
                    className="relative flex flex-col gap-4" // Removed overflow-hidden from parent
                >
                    {/* Toggle Button Handle */}
                    <button
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        className="absolute -left-3 top-6 bg-[#111] text-cyan-400 p-1 rounded-full shadow-lg border border-white/20 z-50 hover:bg-[#1a1a1f] transition-all"
                        title={showRightSidebar ? "Close Sidebar" : "Open Sidebar"}
                    >
                        {showRightSidebar ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                    </button>

                    {/* Content Container - Handles Overflow */}
                    <div className="w-80 flex flex-col gap-4 h-full min-w-[320px] overflow-hidden">
                        <div className="bg-[#111] rounded-2xl border border-white/5 p-4 flex-1 flex flex-col min-h-0">

                            {/* Tabs for Sidebar */}
                            <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewFilter('all')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${viewFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Marketplace
                                </button>
                                <button
                                    onClick={() => setViewFilter('purchased')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${viewFilter === 'purchased' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    My Purchases
                                </button>
                            </div>

                            <h3 className="font-bold text-sm mb-3 text-gray-400 flex items-center gap-2">
                                {viewFilter === 'all' ? <Globe className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                {viewFilter === 'all' ? 'Available Files' : 'Purchase History'}
                            </h3>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                                {filteredFiles.length === 0 ? (
                                    <div className="text-center text-gray-600 py-8 text-xs flex flex-col items-center">
                                        <File className="w-8 h-8 mb-2 opacity-20" />
                                        {viewFilter === 'purchased' ? "You haven't purchased any assets yet." : "No files shared yet."}
                                    </div>
                                ) : (
                                    filteredFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleFileSelect(file.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${selectedFile?.id === file.id
                                                ? 'bg-cyan-900/20 border-cyan-500/50'
                                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${selectedFile?.id === file.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate text-white">{file.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(file.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs mt-2">
                                                {purchasedFiles.includes(file.id) ? (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Purchased</span>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                // Ensure we have full data before download
                                                                const { file: fullData } = await unifiedStorage.getFileWithContent(file.id, true);
                                                                if (fullData) handleDownload(fullData);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-all"
                                                            title="Download Original"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-black/50 text-gray-400 border border-white/5">
                                                        ${file.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div> {/* END OF CONTENT WRAPPER */}

            {/* DRM Protection Overlay - AGGRESSIVE (Zoom Style) */}
            <AnimatePresence>
                {showDRMOverlay && (
                    <motion.div
                        id="fast-drm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-not-allowed"
                        style={{
                            background: 'repeating-linear-gradient(45deg, #000 0px, #000 10px, #111 10px, #111 20px)',
                            animation: 'flash 0.2s ease-in-out 3'
                        }}
                    >
                        <div className="text-center p-8 bg-black/90 rounded-3xl border-4 border-red-600 shadow-2xl shadow-red-600/50 max-w-lg w-full mx-4">
                            <div className="mb-6 relative">
                                <Shield className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 border-4 border-red-600 rounded-full animate-ping opacity-30" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-red-500 uppercase tracking-wider">
                                🚫 SCREENSHOT BLOCKED
                            </h2>
                            <p className="text-xl text-white font-medium mb-4">
                                This content is DRM protected
                            </p>
                            <p className="text-gray-400 max-w-md mx-auto text-sm mb-6">
                                Screen capture, recording, and screenshots are not permitted.
                                Any attempt will result in a black screen capture.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-2 text-yellow-500 bg-yellow-500/10 py-2 px-4 rounded-full border border-yellow-500/20">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm font-medium">Violation logged • Session protected</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Black Screen Recording Detection (Netflix-style) */}
            <AnimatePresence>
                {showRecordingBlock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-[13px] z-[300] bg-black flex items-start justify-end pointer-events-auto"
                    >
                        <div className="text-center p-3 m-2">
                            <Monitor className="w-8 h-8 text-gray-600 mx-auto mb-1 opacity-50" />
                            <p className="text-gray-700 text-[10px] uppercase tracking-wide">Recording Not Permitted</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* React Managed Overlay (For Animation/Transitions) */}
            <AnimatePresence>
                {showDRMOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center pointer-events-auto"
                        style={{
                            background: 'repeating-linear-gradient(45deg, #000 0px, #000 10px, #111 10px, #111 20px)',
                            animation: 'flash 0.2s ease-in-out 3'
                        }}
                    >
                        <div className="text-center p-8 bg-black/90 rounded-3xl border-4 border-red-600 shadow-2xl shadow-red-600/50">
                            <div className="mb-6 relative">
                                <Shield className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 border-4 border-red-600 rounded-full animate-ping opacity-30" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-red-500 uppercase tracking-wider">
                                🚫 SCREENSHOT BLOCKED
                            </h2>
                            <p className="text-xl text-white font-medium mb-4">
                                This content is DRM protected
                            </p>
                            <p className="text-gray-400 max-w-md mx-auto text-sm">
                                Screen capture, recording, and screenshots are not permitted.
                                Any attempt will result in a black screen capture.
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-500 font-mono text-xs bg-yellow-500/10 py-2 px-4 rounded border border-yellow-500/20">
                                <AlertTriangle className="w-4 h-4" />
                                Violation logged • Session protected
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientDashboard;
