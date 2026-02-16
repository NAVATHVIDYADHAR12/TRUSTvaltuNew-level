import React, { useState, useEffect, useRef } from 'react';
import { Lock, AlertTriangle, EyeOff, ShieldAlert, DollarSign, Download, CheckCircle, Smartphone, Play, FileText, Upload, Shield } from 'lucide-react';

import { unifiedStorage } from '../../lib/unified-storage';
import { ProtectedFile, db } from '../../lib/secure-storage';

interface SecureViewerProps {
    onNavigate?: () => void;
}

const SecureViewer: React.FC<SecureViewerProps> = ({ onNavigate }) => {
    const [files, setFiles] = useState<ProtectedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProtectedFile | null>(null);

    const [isSecurityTriggered, setIsSecurityTriggered] = useState(false);
    const [securityMessage, setSecurityMessage] = useState('');
    const [purchasedFiles, setPurchasedFiles] = useState<string[]>([]);
    const [walletBalance, setWalletBalance] = useState(3508);
    const [settings, setSettings] = useState({
        blockRightClick: true,
        blockKeyboard: true,
        blockPrintScreen: true
    });

    useEffect(() => {
        const loadFiles = async () => {
            // Only load MARKET (public) files in this viewer
            // Uploaded files go to 'vault' (History) first
            try {
                const data = await unifiedStorage.getAllFiles('market');
                setFiles(data);
            } catch (e) {
                console.error("Failed to load files", e);
            }

            const savedSettings = localStorage.getItem('drm_settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }

            // Load purchases from DB
            const purchasedIds = await db.getPurchases();
            setPurchasedFiles(purchasedIds);

            // LocalStorage migration (optional)
            const savedPurchases = localStorage.getItem('purchased_files_ids');
            if (savedPurchases) {
                const legacy = JSON.parse(savedPurchases);
                if (legacy.length > 0) {
                    let hasNew = false;
                    for (const pid of legacy) {
                        if (!purchasedIds.includes(pid)) {
                            await db.addPurchase({ fileId: pid, date: new Date().toISOString(), price: 0 });
                            hasNew = true;
                        }
                    }
                    if (hasNew) setPurchasedFiles(prev => [...prev, ...legacy.filter((pid: string) => !prev.includes(pid))]);
                }
            }

            // Load Balance from DB
            const bal = await db.getBalance();
            setWalletBalance(bal);
        };
        loadFiles();

        // Subscribe to DB updates
        const unsubscribeStorage = unifiedStorage.subscribe(loadFiles);
        const unsubscribeWallet = db.subscribe(async () => {
            const bal = await db.getBalance();
            setWalletBalance(bal);
            // Also refresh purchases
            const p = await db.getPurchases();
            setPurchasedFiles(p);
        });

        window.addEventListener('storage', loadFiles);
        return () => {
            window.removeEventListener('storage', loadFiles);
            unsubscribeStorage();
            unsubscribeWallet();
        };
    }, []);

    useEffect(() => {
        // Deselect if file is removed from list (deleted or moved to vault)
        if (selectedFile) {
            const stillExists = files.find(f => f.id === selectedFile.id);
            if (!stillExists) {
                setSelectedFile(null);
            } else if (stillExists !== selectedFile) {
                // Update reference if content changed
                setSelectedFile(stillExists);
            }
        }
    }, [files, selectedFile]);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (settings.blockRightClick) {
                e.preventDefault();
                triggerSecurity('Right-Click Detected');
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!settings.blockKeyboard) return;
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 'p') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 's') ||
                (e.metaKey && e.shiftKey && e.key === '3') ||
                (e.metaKey && e.shiftKey && e.key === '4')
            ) {
                e.preventDefault();
                triggerSecurity('Restricted Key Combination Detected');
            }
        };

        const handleBlur = () => {
            triggerSecurity('Secure Window Lost Focus');
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
        };
    }, [settings]);

    const triggerSecurity = (msg: string) => {
        setSecurityMessage(msg);
        setIsSecurityTriggered(true);
        setTimeout(() => setIsSecurityTriggered(false), 2000);
    };

    const handlePurchase = async (file: ProtectedFile) => {
        // Refresh balance
        const currentBalance = await db.getBalance();

        if (currentBalance < file.price) {
            triggerSecurity('Insufficient Funds');
            alert(`Insufficient funds! Your Wallet Balance: $${currentBalance} `);
            return;
        }

        if (confirm(`Purchase license for "${file.name}" ?\nPrice: $${file.price} \nCurrent Balance: $${currentBalance} `)) {
            const newBalance = currentBalance - file.price;

            // Update DB
            await db.updateBalance(newBalance);
            await db.addTransaction({
                type: 'debit',
                title: `License: ${file.name}`,
                amount: file.price,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Completed'
            });

            await db.addPurchase({
                fileId: file.id,
                date: new Date().toISOString(),
                price: file.price
            });

            // Update local state (optimistic)
            setWalletBalance(newBalance);
            const newPurchased = [...purchasedFiles, file.id];
            setPurchasedFiles(newPurchased);

            // Legacy sync (keep for safety if needed, or remove)
            localStorage.setItem('purchased_files_ids', JSON.stringify(newPurchased));

            triggerSecurity('License Acquired Successfully');
        }
    };

    const handleDownload = (file: ProtectedFile) => {
        const link = document.createElement('a');
        // Use originalSrc if available, otherwise fallback to src
        link.href = file.originalSrc || file.src;

        let ext = 'png';
        if (file.type === 'video') ext = 'mp4';
        if (file.type === 'document') ext = 'pdf'; // Generic fallback

        link.download = `${file.name.replace(/\s+/g, '_')}.${ext} `;
        link.click();
    };

    const renderFileContent = () => {
        if (!selectedFile) {
            return (
                <div className="text-center text-gray-500">
                    <EyeOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a file to view securely</p>
                </div>
            );
        }

        const isPurchased = purchasedFiles.includes(selectedFile.id);
        const ws = selectedFile.watermarkSettings;

        return (
            <div className="relative max-w-full max-h-full flex items-center justify-center h-full w-full">

                {/* Visual Content */}
                {selectedFile.type === 'image' && (
                    <img
                        src={isPurchased ? (selectedFile.originalSrc || selectedFile.src) : selectedFile.src}
                        alt="Protected Content"
                        className="max-h-[70vh] shadow-2xl rounded pointer-events-none select-none"
                    />
                )}

                {selectedFile.type === 'video' && (
                    <div className="relative">
                        <video
                            src={selectedFile.src}
                            className="max-h-[70vh] max-w-full rounded shadow-2xl"
                            controls={isPurchased}
                            controlsList="nodownload"
                        />

                        {/* Dynamic Floating Watermark for Video */}
                        {!isPurchased && ws && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-20">
                                <div
                                    className="text-white font-bold whitespace-nowrap"
                                    style={{
                                        opacity: ws.opacity,
                                        transform: `rotate(${ws.rotation}deg)`,
                                        fontSize: '48px',
                                        textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {ws.isRepeated ? (
                                        <div className="grid grid-cols-3 gap-12 opacity-50">
                                            {Array(9).fill(ws.text).map((t, i) => <span key={i}>{t}</span>)}
                                        </div>
                                    ) : ws.text}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedFile.type === 'document' && (
                    <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10">
                        <FileText className="w-24 h-24 mx-auto text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold text-white">{selectedFile.name}</h3>
                        <p className="text-gray-400 mt-2">Document currently locked/protected.</p>
                        {!isPurchased && (
                            <div className="mt-4 p-2 bg-red-500/20 text-red-400 text-sm rounded border border-red-500/30">
                                Preview Unavailable. Purchase to download.
                            </div>
                        )}
                    </div>
                )}


                {/* Universal Overlay Watermark */}
                {!isPurchased && selectedFile.type !== 'video' && selectedFile.type !== 'image' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 z-20 flex items-center justify-center">
                        <div className="transform -rotate-12 text-4xl md:text-6xl font-black text-white mix-blend-overlay text-center">
                            PREVIEW ONLY • DO NOT DISTRIBUTE
                        </div>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 inset-x-4 mx-auto w-fit max-w-full flex flex-wrap justify-center gap-y-2 items-center gap-x-4 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 z-30 transition-all">
                    {isPurchased ? (
                        <button
                            onClick={() => handleDownload(selectedFile)}
                            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download Original
                        </button>
                    ) : (
                        <button
                            onClick={() => handlePurchase(selectedFile)}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition-colors"
                        >
                            <DollarSign className="w-4 h-4" />
                            Buy License (${selectedFile.price})
                        </button>
                    )}

                    <div className="h-8 w-px bg-white/20" />

                    <div className="flex items-center gap-2 px-4 text-xs text-gray-400">
                        {isPurchased ? (
                            <span className="text-green-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> License Active
                            </span>
                        ) : (
                            <>
                                <Lock className="w-3 h-3 text-red-400" />
                                DRM Active
                            </>
                        )}
                    </div>

                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-xs font-mono text-cyan-400 px-2">
                        Wallet: ${walletBalance}
                    </div>
                </div>
            </div>
        );
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';

            const newFile: ProtectedFile = {
                id: Date.now().toString(),
                name: file.name,
                category: 'vault', // Save to Vault (History) initially, hidden from Market view
                type: type as any,
                src: result,
                originalSrc: result,
                date: new Date().toISOString(),
                price: 0,
                watermarkSettings: {
                    text: 'Protected',
                    opacity: 0.5,
                    rotation: -45,
                    isRepeated: true
                }
            };

            try {
                await unifiedStorage.saveFile(newFile);
                alert("File uploaded to File History. Go to 'My File History' to manage and publish it.");
                // We don't update 'files' state here because 'files' only shows 'market'.
                // The subscription will trigger a reload, but it won't include this new file yet.
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload file.");
            }
        };
        reader.readAsDataURL(file);
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="h-full flex gap-6 relative" ref={containerRef}>
            {/* Security Overlay */}
            {isSecurityTriggered && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-white mb-2">Security Alert</h2>
                    <p className="text-xl text-red-400 font-mono border border-red-500/30 bg-red-500/10 px-4 py-2 rounded">
                        {securityMessage}
                    </p>
                    <p className="text-gray-500 mt-8 text-sm">Action has been logged. Repeated violations may suspend access.</p>
                </div>
            )}

            {/* File List */}
            <div className="w-80 bg-[#111] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                {/* NEW: Quick Upload Section */}
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            Vault Upload
                        </h3>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                        Upload unlisted files directly to your secure history.
                    </p>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-3 rounded-xl transition-colors font-bold text-sm"
                    >
                        <Upload className="w-4 h-4" />
                        Quick Upload to Vault
                    </button>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*,application/pdf"
                    />
                </div>

                {/* Existing: Market Files Section */}
                <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <h3 className="font-bold text-gray-400 text-sm flex items-center gap-2 uppercase tracking-wider">
                        <Lock className="w-3 h-3 text-cyan-500" />
                        Active Market Files
                    </h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{files.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                    {files.length === 0 && (
                        <div className="text-center py-10 text-gray-500 px-4">
                            No active market files. Publish from File History.
                        </div>
                    )}
                    {files.map(file => (
                        <div
                            key={file.id}
                            onClick={() => setSelectedFile(file)}
                            className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedFile?.id === file.id
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="aspect-video bg-black/50 rounded-lg mb-2 overflow-hidden border border-white/5 relative flex items-center justify-center">
                                {file.type === 'image' && <img src={file.src} alt="thumbnail" className="w-full h-full object-cover opacity-50" />}
                                {file.type === 'video' && <Play className="w-8 h-8 text-gray-500" />}
                                {file.type === 'document' && <FileText className="w-8 h-8 text-gray-500" />}
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-sm text-gray-200 truncate max-w-[120px]">{file.name}</div>
                                    <div className="text-xs text-gray-500">{new Date(file.date).toLocaleDateString()}</div>
                                </div>
                                <div className="text-cyan-400 font-bold text-sm top-0.5 relative">
                                    ${file.price}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 relative p-1 overflow-hidden flex items-center justify-center">
                {/* CSS Protection Layer */}
                <div className="absolute inset-0 z-10 select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                {renderFileContent()}
            </div>
        </div>
    );
};

export default SecureViewer;
