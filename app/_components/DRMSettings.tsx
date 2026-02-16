import React, { useState } from 'react';
import { Shield, Lock, Globe, AlertTriangle, Fingerprint, Eye, MousePointer } from 'lucide-react';

const DRMSettings = () => {
    const [settings, setSettings] = useState(() => {
        // Initialize from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('drm_settings');
            if (saved) return JSON.parse(saved);
        }
        return {
            blockRightClick: true,
            blockPrintScreen: true,
            blockKeyboard: true,
            tabFocusProtection: false,
            blockMediaRecorder: true,
            blockPiP: true,
            watermarkOverlay: true,
            forensicWatermark: true,
            requireLogin: true,
            geoRestriction: false,
            expireAfterView: false,
            deviceLimit: 1
        };
    });

    // Save changes to localStorage
    React.useEffect(() => {
        localStorage.setItem('drm_settings', JSON.stringify(settings));
        // Dispatch event so other components can react immediately
        window.dispatchEvent(new Event('storage'));
    }, [settings]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden mb-8">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-900/20 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Shield className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Global Protection Rules</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Configure how your content is protected across all viewer sessions.</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Protection */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MousePointer className="w-4 h-4" /> Input Control
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Block Right-Click</div>
                                <div className="text-xs text-gray-500">Prevents context menu access</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('blockRightClick')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.blockRightClick ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.blockRightClick ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Block Shortcuts</div>
                                <div className="text-xs text-gray-500">Disable copy/save/print keys</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('blockKeyboard')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.blockKeyboard ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.blockKeyboard ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>


                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Anti-Screenshot</div>
                                <div className="text-xs text-gray-500">Blur on focus loss & key blocks</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('blockPrintScreen')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.blockPrintScreen ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.blockPrintScreen ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Access & Advanced Control */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Advanced Security
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Tab Focus Protection</div>
                                <div className="text-xs text-gray-500">Pause content when hidden</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('tabFocusProtection')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.tabFocusProtection ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.tabFocusProtection ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Block Screen Recording</div>
                                <div className="text-xs text-gray-500">Disable MediaRecorder API</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('blockMediaRecorder')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.blockMediaRecorder ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.blockMediaRecorder ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Block PiP Mode</div>
                                <div className="text-xs text-gray-500">Prevent Picture-in-Picture</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('blockPiP')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.blockPiP ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.blockPiP ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Forensic Watermark</div>
                                <div className="text-xs text-gray-500">Invisible user ID embedding</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('forensicWatermark')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.forensicWatermark ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.forensicWatermark ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div>
                                <div className="font-medium text-white">Visual Watermark</div>
                                <div className="text-xs text-gray-500">Visible overlay on content</div>
                            </div>
                            <button
                                onClick={() => toggleSetting('watermarkOverlay')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.watermarkOverlay ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.watermarkOverlay ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="font-bold text-white mb-2">Detection Sensitivity</h3>
                    <p className="text-xs text-gray-400">
                        Current heuristic engine is set to "Strict". False positives may occur with virtual machines.
                    </p>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <Fingerprint className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-bold text-white mb-2">Session Fingerprinting</h3>
                    <p className="text-xs text-gray-400">
                        All viewer sessions are uniquely ID'd and logged to the blockchain audit trail.
                    </p>
                </div>

                <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                    <Globe className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-bold text-white mb-2">Global CDN</h3>
                    <p className="text-xs text-gray-400">
                        Content is encrypted at rest and distributed via our edge network for low latency.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DRMSettings;
