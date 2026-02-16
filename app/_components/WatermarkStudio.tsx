import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Save, Type, Image as ImageIcon, RotateCw, Grid, Layout, Video, FileText, Link as LinkIcon, Globe, Lock, Shield, Eye, EyeOff, Monitor, VideoOff, Fingerprint, Activity, Tv, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { unifiedStorage } from '../../lib/unified-storage';
import DRMSettings from './DRMSettings';

const WatermarkStudio = () => {
    // State
    const [fileType, setFileType] = useState<'image' | 'video' | 'document'>('image');
    const [sourceFile, setSourceFile] = useState<string | null>(null);
    const [originalFileSrc, setOriginalFileSrc] = useState<string | null>(null);

    // Watermark Settings
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkText, setWatermarkText] = useState('Confidential');
    const [opacity, setOpacity] = useState(0.3);
    const [rotation, setRotation] = useState(-30);
    const [fontSize, setFontSize] = useState(24);
    const [textColor, setTextColor] = useState('#ffffff');
    const [isRepeated, setIsRepeated] = useState(true);
    const [price, setPrice] = useState(100);
    const [category, setCategory] = useState<'market' | 'vault'>('market');
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // DRM Settings
    const [drmSettings, setDrmSettings] = useState({
        blockRightClick: true,
        blockShortcuts: true,
        blockPrintScreen: true,
        antiScreenshot: true,
        tabFocusProtection: false,
        blockMediaRecorder: true,
        blockPiP: true,
        forensicWatermark: true,
        visualWatermark: true
    });

    const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);

    // Anti-Screenshot Protection State
    const [showDRMOverlay, setShowDRMOverlay] = useState(false);
    const [showRecordingBlock, setShowRecordingBlock] = useState(false); // Black screen for recording detection
    const isPenaltyActive = useRef(false);
    const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to toggle settings and sync GLOBALLY for Real-Time effect
    const toggleDrmSetting = (key: keyof typeof drmSettings) => {
        const newVal = !drmSettings[key];
        const newSettings = { ...drmSettings, [key]: newVal };
        setDrmSettings(newSettings);

        // SYNC GLOBALLY to satisfy "Real Time" requirement
        localStorage.setItem('drm_settings', JSON.stringify(newSettings));

        // Dispatch event for ClientDashboard to pick up immediately
        window.dispatchEvent(new CustomEvent('drmSettingsChanged', { detail: newSettings }));
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const processFile = (file: File) => {
        if (file.size > 15 * 1024 * 1024) {
            alert("File is too large (>15MB). Please use a smaller file for this demo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setSourceFile(result);
            setOriginalFileSrc(result);
        };
        reader.readAsDataURL(file);
    };

    // Handle File Input
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    // Handle Drag & Drop
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Auto-detect type
            if (file.type.startsWith('image/')) setFileType('image');
            else if (file.type.startsWith('video/')) setFileType('video');
            else setFileType('document');

            processFile(file);
        }
    };

    // Draw Watermark (for Images)
    const drawWatermark = useCallback(() => {
        if (fileType !== 'image') return;
        const canvas = canvasRef.current;
        if (!canvas || !sourceFile) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = sourceFile;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (isRepeated) {
                const diagonal = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
                const tileSize = 300;
                for (let x = -diagonal; x < diagonal; x += tileSize) {
                    for (let y = -diagonal; y < diagonal; y += tileSize) {
                        ctx.save();
                        ctx.translate(x + canvas.width / 2, y + canvas.height / 2);
                        ctx.rotate((rotation * Math.PI) / 180);
                        ctx.fillText(watermarkText, 0, 0);
                        ctx.restore();
                    }
                }
            } else {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.fillText(watermarkText, 0, 0);
            }
            ctx.restore();
        };
    }, [sourceFile, watermarkText, opacity, rotation, fontSize, textColor, isRepeated, fileType]);

    useEffect(() => {
        drawWatermark();
    }, [drawWatermark]);

    // Screen Recording Detection (Netflix-style Black Screen)
    // Uses periodic black flashes to make recordings unusable
    useEffect(() => {
        if (!drmSettings.blockMediaRecorder) {
            setShowRecordingBlock(false);
            return;
        }

        const handleRecordingBlur = () => {
            setShowRecordingBlock(true);
            setTimeout(() => {
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
    }, [drmSettings.blockMediaRecorder]);

    // Anti-Screenshot Protection (Creator View)
    useEffect(() => {
        const forcePaint = (el: HTMLElement) => void el.offsetHeight;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (drmSettings.blockPrintScreen || drmSettings.antiScreenshot) {
                const isScreenshotAttempt =
                    e.key === 'PrintScreen' ||
                    (e.key === 'S' && e.shiftKey && (e.metaKey || e.getModifierState('Meta'))) ||
                    (e.key === 's' && e.shiftKey && e.ctrlKey) ||
                    (e.key === 'Print') ||
                    (e.key === '3' && e.metaKey && e.shiftKey) ||
                    (e.key === '4' && e.metaKey && e.shiftKey) ||
                    (e.key === '5' && e.metaKey && e.shiftKey);

                if (isScreenshotAttempt) {
                    try { navigator.clipboard.writeText(''); } catch (e) { }
                    e.preventDefault();
                    e.stopPropagation();

                    // 1. INSTANT SAFETY: Hide Content
                    const content = document.getElementById('creator-content');
                    if (content) {
                        content.style.opacity = '0';
                        forcePaint(content);
                    }

                    // 2. SHOW OVERLAY
                    setShowDRMOverlay(true);
                    isPenaltyActive.current = true;

                    // 3. SET 3s TIMEOUT
                    if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);

                    document.body.style.userSelect = 'none';
                    document.body.style.webkitUserSelect = 'none';

                    penaltyTimerRef.current = setTimeout(() => {
                        isPenaltyActive.current = false;
                        setShowDRMOverlay(false);

                        if (content) {
                            content.style.opacity = '1';
                            content.style.filter = 'none';
                        }
                        document.body.style.userSelect = 'auto';
                        document.body.style.webkitUserSelect = 'auto';
                    }, 3000); // 3s Strict Penalty
                }
            }
        };

        const handleBlur = () => {
            if (drmSettings.antiScreenshot || drmSettings.blockPrintScreen) {
                const content = document.getElementById('creator-content');
                if (content) {
                    content.style.opacity = '0';
                    content.style.filter = 'blur(20px)';
                    forcePaint(content);
                }

                setShowDRMOverlay(true);

                // NO TIMEOUT - keep hidden until focus returns or penalty ends
            }
        };

        const handleFocus = () => {
            if (drmSettings.antiScreenshot || drmSettings.blockPrintScreen) {
                // Wait a tiny bit to ensure penalty has been set if PrintScreen was pressed
                setTimeout(() => {
                    if (!isPenaltyActive.current && !document.hidden) {
                        const content = document.getElementById('creator-content');
                        if (content) {
                            content.style.opacity = '1';
                            content.style.filter = 'none';
                        }
                        setShowDRMOverlay(false);
                    }
                }, 50); // Small delay to ensure keydown has set penalty if needed
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [drmSettings]);

    const handleSave = async () => {
        if (!sourceFile) return;
        setIsSaving(true);

        try {
            let previewSrc = sourceFile;

            // For images, generate the watermarked version as the preview
            if (fileType === 'image' && canvasRef.current) {
                previewSrc = canvasRef.current.toDataURL('image/jpeg', 0.7);
            }

            const newFile = {
                id: crypto.randomUUID(),
                name: `Protected_${fileType}_${new Date().toLocaleTimeString()}`,
                type: fileType,
                src: previewSrc,
                originalSrc: originalFileSrc,
                date: new Date().toISOString(),
                price: price,
                category: category,
                watermarkSettings: {
                    text: watermarkText,
                    opacity,
                    rotation,
                    fontSize,
                    color: textColor,
                    isRepeated
                },
                drmSettings: {
                    ...drmSettings,
                    visualWatermark: true // Always true if we are in this studio, or controlled by toggle? Let's use the state.
                }
            };

            await unifiedStorage.saveFile(newFile);

            setIsSaving(false);
            alert(`File Protected & SAVED to ${category === 'market' ? 'Public Marketplace' : 'Private Vault'}!`);

            // Reset
            setSourceFile(null);
            setOriginalFileSrc(null);
        } catch (error) {
            console.error("Storage Error:", error);
            setIsSaving(false);
            alert('Error saving file. Files over 15MB might be too large for this demo.');
        }
    };

    return (
        <div className="h-full flex flex-col xl:flex-row gap-6">
            {/* Editor Panel */}
            <div id="creator-content" className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden group" style={{ willChange: 'filter' }}>

                {/* File Type Tabs */}
                <div className="flex gap-4 mb-2 justify-center">
                    {(['image', 'video', 'document'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => { setFileType(type); setSourceFile(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${fileType === type ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {type === 'image' && <ImageIcon className="w-4 h-4" />}
                            {type === 'video' && <Video className="w-4 h-4" />}
                            {type === 'document' && <FileText className="w-4 h-4" />}
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                    {!sourceFile ? (
                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`text-center p-8 border-2 border-dashed rounded-xl transition-all w-full h-full flex flex-col items-center justify-center ${isDragging
                                ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                                : 'border-white/10 hover:bg-white/5'
                                }`}
                        >
                            <Upload className={`w-12 h-12 mx-auto mb-2 transition-colors ${isDragging ? 'text-cyan-400' : 'text-gray-500'}`} />
                            <h3 className="text-xl font-bold text-white mb-1">
                                {isDragging ? 'Drop to Upload' : `Upload ${fileType === 'document' ? 'Document/Image' : fileType} Source`}
                            </h3>
                            <p className="text-gray-400 mb-4 text-sm">Drag and drop or click to upload</p>
                            <input
                                type="file"
                                accept={fileType === 'image' ? "image/*" : fileType === 'video' ? "video/*" : "*/*"}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg cursor-pointer font-bold transition-all"
                            >
                                Select File
                            </label>
                        </div>
                    ) : (
                        <div className="relative max-w-full max-h-full">
                            {fileType === 'image' && (
                                <canvas ref={canvasRef} className="max-w-full max-h-[60vh] shadow-2xl rounded-lg" />
                            )}

                            {fileType === 'video' && (
                                <div className="relative">
                                    <video src={sourceFile} className="max-w-full max-h-[60vh] rounded-lg" controls />
                                    {/* CSS Watermark Overlay Preview */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10">
                                        <div
                                            className="font-bold whitespace-nowrap"
                                            style={{
                                                color: textColor,
                                                opacity: opacity,
                                                transform: `rotate(${rotation}deg)`,
                                                fontSize: `${fontSize * 2}px`,
                                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                            }}
                                        >
                                            {isRepeated ? (
                                                <div className="grid grid-cols-3 gap-12 opacity-50">
                                                    {Array(9).fill(watermarkText).map((t, i) => <span key={i}>{t}</span>)}
                                                </div>
                                            ) : watermarkText}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {fileType === 'document' && (
                                <div className="bg-white/10 p-12 rounded-xl text-center">
                                    <FileText className="w-24 h-24 mx-auto text-cyan-400 mb-4" />
                                    <p className="text-white font-mono truncate max-w-sm">Document Loaded</p>
                                    <div className="mt-4 p-4 border border-dashed border-white/20 rounded">
                                        <p className="text-sm text-gray-400">Watermark will be applied to preview where possible.</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setSourceFile(null)}
                                className="absolute -top-12 right-0 p-2 bg-black/60 text-white hover:bg-red-500/80 rounded-full transition-colors z-20"
                            >
                                <Layout className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Panel */}
            <div className="w-full xl:w-96 bg-[#111] rounded-2xl border border-white/5 p-6 h-fit overflow-y-auto custom-scrollbar max-h-full">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Type className="w-5 h-5 text-cyan-400" />
                    Watermark Settings
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Content</label>
                        <input
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            placeholder="Confidential"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Opacity ({opacity})</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Rotation ({rotation}°)</label>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={rotation}
                                onChange={(e) => setRotation(parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Details</label>
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-10 bg-black/40 border border-white/10 rounded-lg cursor-pointer p-1"
                            title="Text Color"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Size: {fontSize}px</label>
                        <input
                            type="range"
                            min="12"
                            max="72"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full accent-cyan-500 mt-2"
                        />
                    </div>
                </div>

                {fileType !== 'document' && (
                    <div className="mt-6">
                        <label className="text-sm text-gray-400 block mb-2">Pattern</label>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
                            <button
                                onClick={() => setIsRepeated(false)}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isRepeated ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Single
                            </button>
                            <button
                                onClick={() => setIsRepeated(true)}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isRepeated ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Repeated
                            </button>
                        </div>
                    </div>
                )}

                <hr className="border-white/5 my-6" />

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        DRM Protection
                    </h3>
                    <button
                        onClick={() => setIsGlobalSettingsOpen(true)}
                        className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <Globe className="w-3 h-3" />
                        Client View Rules
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Block Right Click */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Shield className={`w-4 h-4 ${drmSettings.blockRightClick ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Block Right-Click</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('blockRightClick')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.blockRightClick ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.blockRightClick ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Block Shortcuts */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Lock className={`w-4 h-4 ${drmSettings.blockShortcuts ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Block Shortcuts</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('blockShortcuts')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.blockShortcuts ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.blockShortcuts ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Block PrintScreen */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Monitor className={`w-4 h-4 ${drmSettings.blockPrintScreen ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Block PrintScreen</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('blockPrintScreen')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.blockPrintScreen ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.blockPrintScreen ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Anti-Screenshot */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <EyeOff className={`w-4 h-4 ${drmSettings.antiScreenshot ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Anti-Screenshot (Blur)</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('antiScreenshot')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.antiScreenshot ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.antiScreenshot ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Tab Protection */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Activity className={`w-4 h-4 ${drmSettings.tabFocusProtection ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Tab Focus Protection</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('tabFocusProtection')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.tabFocusProtection ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.tabFocusProtection ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Forensic Watermark */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <Fingerprint className={`w-4 h-4 ${drmSettings.forensicWatermark ? 'text-cyan-400' : 'text-gray-500'}`} />
                            <span className="text-sm text-gray-300">Forensic Watermark</span>
                        </div>
                        <button
                            onClick={() => toggleDrmSetting('forensicWatermark')}
                            className={`w-10 h-5 rounded-full transition-all relative ${drmSettings.forensicWatermark ? 'bg-cyan-600' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${drmSettings.forensicWatermark ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>

                <hr className="border-white/5 my-6" />

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">License Price ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-bold text-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Publish To</label>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
                            <button
                                onClick={() => setCategory('market')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${category === 'market' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Globe className="w-4 h-4" />
                                Public Market
                            </button>
                            <button
                                onClick={() => setCategory('vault')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${category === 'vault' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Lock className="w-4 h-4" />
                                Private Vault
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        disabled={!sourceFile || isSaving}
                        className={`w-full py-4 text-center font-bold text-black rounded-xl transition-all flex items-center justify-center gap-2 ${!sourceFile || isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'}`}
                    >
                        {isSaving ? 'Processing...' : (
                            <>
                                <Save className="w-5 h-5" />
                                {category === 'market' ? 'Publish to Marketplace' : 'Save to Secure Vault'}
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Global Settings Modal */}
            {isGlobalSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/20 shadow-2xl relative">
                        <button
                            onClick={() => setIsGlobalSettingsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="p-2">
                            <DRMSettings />
                        </div>
                    </div>
                </div>
            )}

            {/* Black Screen Recording Detection (Netflix-style) */}
            <AnimatePresence>
                {showRecordingBlock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-[13px] z-[10000] bg-black flex items-start justify-end pointer-events-auto"
                    >
                        <div className="text-center p-3 m-2">
                            <Monitor className="w-8 h-8 text-gray-600 mx-auto mb-1 opacity-50" />
                            <p className="text-gray-700 text-[10px] uppercase tracking-wide">Recording Not Permitted</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DRM Protection Overlay - AGGRESSIVE (Same as Client Dashboard) */}
            <AnimatePresence>
                {showDRMOverlay && (
                    <motion.div
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
                                This Creator content is DRM protected
                            </p>
                            <p className="text-gray-400 max-w-md mx-auto text-sm mb-6">
                                Screen capture, recording, and screenshots are not permitted in Creator View.
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
        </div>
    );
};

export default WatermarkStudio;
