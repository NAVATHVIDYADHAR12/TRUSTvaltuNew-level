"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, File, Video, Image as ImageIcon, FileText, Clock, AlertTriangle, Eye, Globe, X, Check } from 'lucide-react';
import { unifiedStorage } from '../../lib/unified-storage';
import { ProtectedFile } from '../../lib/secure-storage';

const FileHistoryPanel = () => {
    const [files, setFiles] = useState<ProtectedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const loadFiles = async () => {
        try {
            // Load all files from unified storage (both vault and market)
            const marketFiles = await unifiedStorage.getAllFiles('market');
            const vaultFiles = await unifiedStorage.getAllFiles('vault');
            setFiles([...marketFiles, ...vaultFiles]);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load files", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
        // Subscribe to real-time updates from other tabs
        const unsubscribe = unifiedStorage.subscribe(loadFiles);
        return () => {
            unsubscribe();
        };
    }, []);

    const handleRequestDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setConfirmId(id);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmId(null);
    };

    const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        setDeletingId(id);
        setConfirmId(null);

        try {
            await unifiedStorage.deleteFile(id);
            setFiles(prev => prev.filter(f => f.id !== id));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('secure-storage-update'));
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('WARNING: This will permanently delete ALL protected files. This action cannot be undone.')) {
            try {
                // Delete all files one by one using unified storage
                for (const file of files) {
                    await unifiedStorage.deleteFile(file.id);
                }
                setFiles([]);
            } catch (e) { console.error(e); }
        }
    };

    const handlePublish = async (e: React.MouseEvent, file: ProtectedFile) => {
        e.stopPropagation();
        try {
            const updated = { ...file, category: 'market' as const };
            await unifiedStorage.updateFile(updated);
            alert(`"${file.name}" is now visible in Secure Viewer & Client Dashboard.`);
            // Refresh list to update UI (though category change might not remove it from here if we list all)
            loadFiles();
        } catch (err) {
            console.error("Failed to publish", err);
            alert("Failed to update file visibility.");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5 text-blue-400" />;
            case 'document': return <FileText className="w-5 h-5 text-orange-400" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-purple-400" />;
            default: return <File className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">File History</h2>
                    <p className="text-sm text-gray-400">Manage your protected assets</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors z-10 relative cursor-pointer hover:bg-red-500/20"
                    >
                        Clear All
                    </button>
                    <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {files.length} Files Stored
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading assets...</div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No files protected yet.</p>
                        <p className="text-sm">Upload content via Watermark Studio.</p>
                    </div>
                ) : (
                    files.map((file) => (
                        <div key={file.id} className="bg-white/5 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 relative">
                            <div className="p-3 bg-black/40 rounded-lg shrink-0">
                                {getIcon(file.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate">{file.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(file.date).toLocaleString()}
                                    </span>
                                    <span className="font-mono text-cyan-400">${file.price}</span>
                                    <span className="capitalize bg-black/50 px-2 py-0.5 rounded border border-white/5">{file.type}</span>
                                </div>
                            </div>

                            {file.category !== 'market' && (
                                <button
                                    onClick={(e) => handlePublish(e, file)}
                                    className="px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium z-10 cursor-pointer border border-cyan-500/20"
                                >
                                    <Globe className="w-4 h-4" />
                                    Publish to Viewer
                                </button>
                            )}
                            {confirmId === file.id ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                    <button
                                        onClick={(e) => handleConfirmDelete(e, file.id)}
                                        className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold z-20 cursor-pointer shadow-lg shadow-red-900/20"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirm
                                    </button>
                                    <button
                                        onClick={handleCancelDelete}
                                        className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors z-20 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleRequestDelete(e, file.id)}
                                    disabled={deletingId === file.id}
                                    className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium z-10 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deletingId === file.id ? 'Removing...' : 'Remove'}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FileHistoryPanel;
