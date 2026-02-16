"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GlobalNavbar from '../../_components/GlobalNavbar';
import { Video, Mic, MicOff, Camera, CameraOff, PhoneOff, Copy, Users, Shield, Circle, Square, Share2, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveRecording, ZoomRecording } from '../_utils/recordingsDB';
import {
    initAdvancedDRM,
    blockPictureInPicture,
    createProtectionOverlay,
    ForensicWatermark,
    VisibilityMonitor,
    generateSessionFingerprint
} from '../_utils/advancedDRM';

// DRM Protection Hook
const useDRMProtection = () => {
    const [drmEnabled, setDrmEnabled] = useState(true);
    const [drmSettings, setDrmSettings] = useState({
        screenshotBlocking: true,
        tabFocusProtection: true,
        devToolsDetection: false,
        rightClickDisable: true,
        screenRecordingBlock: true,
        watermarkOverlay: false,
        // Advanced DRM features
        forensicWatermark: true,
        mediaRecorderBlock: true,
        pipBlock: true,
        heartbeatProtection: true
    });

    // Load initial settings from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEnabled = localStorage.getItem('drmProtectionEnabled');
            setDrmEnabled(savedEnabled !== 'false');

            const savedSettings = localStorage.getItem('drmSettings');
            if (savedSettings) {
                try {
                    setDrmSettings(JSON.parse(savedSettings));
                } catch (e) {
                    console.error('Failed to parse DRM settings');
                }
            }
        }
    }, []);

    // Listen for real-time DRM settings changes from navbar modal
    useEffect(() => {
        const handleSettingsChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                console.log('DRM Settings Changed:', customEvent.detail);
                setDrmSettings(customEvent.detail);
            }
        };

        window.addEventListener('drmSettingsChanged', handleSettingsChange);

        return () => {
            window.removeEventListener('drmSettingsChanged', handleSettingsChange);
        };
    }, []);

    return { drmEnabled, drmSettings, setDrmSettings };
};

export default function MeetingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = (params?.roomId as string) || '';

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number>(0);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [participants] = useState(['You', 'Guest User']);
    const [showDRMOverlay, setShowDRMOverlay] = useState(false);
    const [recordingSaved, setRecordingSaved] = useState(false);
    const [autoRecordingStarted, setAutoRecordingStarted] = useState(false);
    const [sessionFingerprint, setSessionFingerprint] = useState<string>('');
    const [drmViolationCount, setDrmViolationCount] = useState(0);
    const [advancedDRMActive, setAdvancedDRMActive] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    const { drmEnabled, drmSettings } = useDRMProtection();

    // Initialize Advanced DRM Protection
    useEffect(() => {
        if (drmEnabled && !advancedDRMActive) {
            const { fingerprint, cleanup } = initAdvancedDRM({
                userId: `user-${roomId}`,
                sessionId: `session-${Date.now()}`,
                enableForensicWatermark: drmSettings.forensicWatermark,
                enableMediaRecorderBlock: drmSettings.mediaRecorderBlock,
                enablePiPBlock: drmSettings.pipBlock,
                enableDevToolsDetection: drmSettings.devToolsDetection,
                enableCanvasProtection: drmSettings.screenshotBlocking,
                enableHeartbeat: drmSettings.heartbeatProtection
            });

            setSessionFingerprint(fingerprint);
            setAdvancedDRMActive(true);

            // Listen for DRM violations
            const handleViolation = (e: Event) => {
                const detail = (e as CustomEvent).detail;
                setDrmViolationCount(prev => prev + 1);
                console.warn(`DRM Violation #${drmViolationCount + 1}: ${detail.type}`);

                // Show warning overlay
                setShowDRMOverlay(true);
                setTimeout(() => setShowDRMOverlay(false), 5000);
            };

            window.addEventListener('drmViolation', handleViolation);

            return () => {
                cleanup();
                window.removeEventListener('drmViolation', handleViolation);
            };
        }
    }, [drmEnabled, drmSettings, advancedDRMActive, roomId, drmViolationCount]);

    // Block PiP on video element
    useEffect(() => {
        if (videoRef.current && drmEnabled && drmSettings.pipBlock) {
            blockPictureInPicture(videoRef.current);
        }
    }, [stream, drmEnabled, drmSettings.pipBlock]);

    // Create protection overlay on video container
    useEffect(() => {
        if (videoContainerRef.current && drmEnabled && drmSettings.screenshotBlocking) {
            const overlay = createProtectionOverlay(videoContainerRef.current);
            return () => {
                overlay.remove();
            };
        }
    }, [drmEnabled, drmSettings.screenshotBlocking]);

    // Forensic Watermark Overlay
    useEffect(() => {
        if (videoContainerRef.current && drmEnabled && drmSettings.forensicWatermark && roomId) {
            const watermark = new ForensicWatermark(`user-${roomId}`);
            const { clientWidth, clientHeight } = videoContainerRef.current;
            // Ensure dimensions are valid
            if (clientWidth > 0 && clientHeight > 0) {
                const canvas = watermark.createWatermarkOverlay(clientWidth, clientHeight);

                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.pointerEvents = 'none';
                canvas.style.zIndex = '20';
                canvas.style.opacity = '0.01'; // Almost invisible

                videoContainerRef.current.appendChild(canvas);

                return () => {
                    canvas.remove();
                };
            }
        }
    }, [drmEnabled, drmSettings.forensicWatermark, roomId]);

    // Start camera/mic on mount
    useEffect(() => {
        const startMedia = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error('Media access error:', err);
            }
        };
        startMedia();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Recording timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // AUTO-RECORDING: Start recording automatically when stream is ready
    useEffect(() => {
        if (stream && !autoRecordingStarted && !isRecording) {
            // Small delay to ensure stream is fully ready
            const timer = setTimeout(() => {
                console.log('🎬 Auto-recording started...');

                recordedChunksRef.current = [];
                recordingStartTimeRef.current = Date.now();

                try {
                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm;codecs=vp9'
                    });

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            recordedChunksRef.current.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                        if (blob.size > 0) {
                            await handleSaveRecording(blob);
                        }
                    };

                    mediaRecorder.start(1000);
                    mediaRecorderRef.current = mediaRecorder;
                    setIsRecording(true);
                    setRecordingTime(0);
                    setAutoRecordingStarted(true);
                } catch (err) {
                    console.error('Failed to start auto-recording:', err);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [stream, autoRecordingStarted, isRecording]);

    // Enhanced DRM Protection with Aggressive Screenshot Blocking
    useEffect(() => {
        if (!drmEnabled) return;

        // State for screenshot warning
        let screenshotWarningTimeout: NodeJS.Timeout;

        // Tab visibility detection
        const handleVisibilityChange = () => {
            if (document.hidden && drmSettings.tabFocusProtection) {
                setShowDRMOverlay(true);
            } else {
                setShowDRMOverlay(false);
            }
        };

        // Right-click disable
        const handleContextMenu = (e: MouseEvent) => {
            if (drmSettings.rightClickDisable) {
                e.preventDefault();
            }
        };

        // AGGRESSIVE SCREENSHOT BLOCKING
        const handleKeyDown = (e: KeyboardEvent) => {
            // DevTools detection
            if (drmSettings.devToolsDetection) {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    setShowDRMOverlay(true);
                    setTimeout(() => setShowDRMOverlay(false), 20000);
                    return;
                }
            }

            // SCREENSHOT BLOCKING - Detect PrintScreen and common screenshot shortcuts
            if (drmSettings.screenshotBlocking) {
                const isScreenshotAttempt =
                    e.key === 'PrintScreen' ||
                    (e.key === 'S' && e.shiftKey && (e.metaKey || e.getModifierState('Meta'))) || // Win+Shift+S
                    (e.key === 's' && e.shiftKey && e.ctrlKey) || // Some screenshot tools
                    (e.key === 'Print') ||
                    (e.key === '3' && e.metaKey && e.shiftKey) || // Mac screenshot
                    (e.key === '4' && e.metaKey && e.shiftKey) || // Mac screenshot 
                    (e.key === '5' && e.metaKey && e.shiftKey);   // Mac screenshot

                if (isScreenshotAttempt) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Show aggressive warning overlay
                    setShowDRMOverlay(true);

                    // Log the attempt
                    console.warn('🔒 DRM: Screenshot attempt blocked!');

                    // Hide overlay after 20 seconds
                    clearTimeout(screenshotWarningTimeout);
                    screenshotWarningTimeout = setTimeout(() => {
                        setShowDRMOverlay(false);
                    }, 20000);
                }
            }
        };

        // Clipboard monitoring - detect if screenshot was taken
        const handleCopy = (e: ClipboardEvent) => {
            if (drmSettings.screenshotBlocking) {
                // Check if clipboard contains image data
                if (e.clipboardData?.types.includes('image/png') ||
                    e.clipboardData?.types.includes('image/jpeg')) {
                    e.preventDefault();
                    setShowDRMOverlay(true);
                    setTimeout(() => setShowDRMOverlay(false), 20000);
                }
            }
        };

        // Blur event - another tab/app might be taking screenshot
        const handleBlur = () => {
            if (drmSettings.screenshotBlocking) {
                // Brief flash of overlay to disrupt capture
                setShowDRMOverlay(true);
                setTimeout(() => {
                    if (!document.hidden) {
                        setShowDRMOverlay(false);
                    }
                }, 100);
            }
        };

        // Screen recording detection via display-capture permission (experimental)
        const checkScreenCapture = async () => {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'display-capture' as PermissionName });
                if (permissionStatus.state === 'granted') {
                    console.log('DRM Warning: Screen capture may be active');
                }
            } catch (e) {
                // Not supported in all browsers
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        document.addEventListener('keyup', handleKeyDown, true);
        document.addEventListener('copy', handleCopy);
        window.addEventListener('blur', handleBlur);
        checkScreenCapture();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('keyup', handleKeyDown, true);
            document.removeEventListener('copy', handleCopy);
            window.removeEventListener('blur', handleBlur);
            clearTimeout(screenshotWarningTimeout);
        };
    }, [drmEnabled, drmSettings]);

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setMicEnabled(!micEnabled);
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setCameraEnabled(!cameraEnabled);
        }
    };

    const startRecording = () => {
        if (stream) {
            recordedChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                await handleSaveRecording(blob);
            };

            mediaRecorder.start(1000); // Collect data every second
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(0);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSaveRecording = async (blob: Blob) => {
        const recording: ZoomRecording = {
            id: Date.now().toString(),
            roomId,
            date: new Date().toLocaleString(),
            duration: formatTime(recordingTime),
            size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
            blob,
            timestamp: Date.now()
        };

        try {
            // Save to IndexedDB
            await saveRecording(recording);
            setRecordingSaved(true);
            setTimeout(() => setRecordingSaved(false), 3000);
            console.log('Recording saved to History:', recording.id);
        } catch (err) {
            console.error('Failed to save recording:', err);
            // Fallback: trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting-${roomId}-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/zoom/${roomId}`;
        navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const endCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (isRecording) {
            stopRecording();
        }
        router.push('/search?tab=history');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col">
            <GlobalNavbar />

            {/* DRM Protection Overlay - AGGRESSIVE */}
            <AnimatePresence>
                {showDRMOverlay && drmEnabled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
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
                            <div className="mt-6 flex items-center justify-center gap-2 text-yellow-500">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm font-medium">Violation logged • Session protected</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recording Saved Toast */}
            <AnimatePresence>
                {recordingSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600/90 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg"
                    >
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Recording saved to History!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auto-Recording Started Notification */}
            <AnimatePresence>
                {autoRecordingStarted && isRecording && recordingTime < 5 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-purple-600/90 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg border border-purple-400/30"
                    >
                        <Circle className="w-4 h-4 fill-red-500 animate-pulse" />
                        <span className="font-medium">🎬 Auto-Recording started! Your meeting will be saved to History.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Video Area */}
            <main className="flex-1 flex flex-col p-4">
                {/* Room Info Bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span className="text-sm text-gray-400">Room:</span>
                            <span className="font-mono font-bold tracking-widest">{roomId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            {participants.length} participants
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1.5 rounded-full border border-red-500/30"
                            >
                                <Circle className="w-3 h-3 fill-red-500 animate-pulse" />
                                <span className="text-sm font-medium">
                                    {autoRecordingStarted && <span className="text-red-300 mr-1">AUTO</span>}
                                    REC {formatTime(recordingTime)}
                                </span>
                            </motion.div>
                        )}
                        {drmEnabled && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/30">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                        {advancedDRMActive ? 'DRM+' : 'DRM'}
                                    </span>
                                </div>
                                {sessionFingerprint && (
                                    <div className="flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 text-xs">
                                        <span className="font-mono">{sessionFingerprint}</span>
                                    </div>
                                )}
                                {drmViolationCount > 0 && (
                                    <div className="flex items-center gap-1 bg-red-600/30 text-red-400 px-2 py-1 rounded-full border border-red-500/30 text-xs animate-pulse">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>{drmViolationCount} violations</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Local Video (You) - DRM Protected */}
                    <div
                        ref={videoContainerRef}
                        className={`relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 ${drmEnabled && drmSettings.screenshotBlocking ? 'drm-video-protected' : ''} ${drmEnabled && drmSettings.screenRecordingBlock ? 'screen-recording-blocked' : ''}`}
                    >
                        {cameraEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover min-h-[300px]"
                                style={drmEnabled && drmSettings.screenshotBlocking ? {
                                    // Netflix-style: Make video unselectable and harder to capture
                                    WebkitUserSelect: 'none',
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                } : {}}
                            />
                        ) : (
                            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
                                    Y
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                            You {!micEnabled && '(muted)'}
                        </div>

                        {/* VISIBLE WATERMARK - Only when watermarkOverlay is enabled */}
                        {drmEnabled && drmSettings.watermarkOverlay && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                                {/* Diagonal repeating watermark */}
                                <div className="absolute inset-0" style={{
                                    background: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.03) 50px, rgba(255,0,0,0.03) 100px)',
                                }}>
                                    {/* Multiple watermark texts */}
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute text-red-500/10 font-black text-2xl uppercase tracking-widest select-none"
                                            style={{
                                                transform: `rotate(-30deg) translate(${i * 150 - 200}px, ${i * 80}px)`,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            🔒 PROTECTED • DRM SECURED • 🔒 PROTECTED • DRM SECURED
                                        </div>
                                    ))}
                                </div>
                                {/* Center shield icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-32 h-32 text-white/5" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remote Video (Simulated) */}
                    <div className="relative bg-[#111] rounded-2xl overflow-hidden border border-white/5">
                        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                                    G
                                </div>
                                <p className="text-gray-400">Waiting for others to join...</p>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                            Guest User
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-center gap-4 py-4 bg-[#111] rounded-2xl border border-white/5">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        title={micEnabled ? 'Mute' : 'Unmute'}
                    >
                        {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleCamera}
                        className={`p-4 rounded-full transition-all ${cameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {cameraEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                        {isRecording ? <Square className="w-6 h-6 fill-white" /> : <Circle className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        title="Invite"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>

                    <button
                        onClick={endCall}
                        className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
                        title="End Call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </main>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] w-full max-w-md rounded-3xl border border-white/10 p-6"
                        >
                            <h2 className="text-xl font-bold mb-4">Invite to Meeting</h2>
                            <p className="text-gray-400 text-sm mb-6">Share this link or room code to invite others.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Room Code</label>
                                    <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-xl tracking-widest text-center">
                                        {roomId}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Invite Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/zoom/${roomId}`}
                                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300"
                                        />
                                        <button
                                            onClick={copyInviteLink}
                                            className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${linkCopied ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                        >
                                            {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Netflix-style DRM CSS Protection */}
            <style jsx global>{`
                /* Prevent video capture via CSS */
                .drm-video-protected {
                    -webkit-user-select: none;
                    user-select: none;
                }
                
                .drm-video-protected video {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
                
                /* Hide content when printing (screenshot via print) */
                @media print {
                    .drm-video-protected,
                    .drm-video-protected video {
                        visibility: hidden !important;
                        display: none !important;
                    }
                }
                
                /* Experimental: Make video harder to screen record */
                .drm-video-protected video {
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                
                /* Netflix-Style Screen Recording Block */
                /* This uses hardware acceleration and display list isolation */
                .screen-recording-blocked {
                    /* Force GPU compositing which some screen recorders can't capture */
                    transform: translate3d(0, 0, 0);
                    -webkit-transform: translate3d(0, 0, 0);
                    
                    /* Isolate from parent composition */
                    isolation: isolate;
                    contain: strict;
                    
                    /* Force hardware acceleration on video */
                    will-change: transform;
                }
                
                .screen-recording-blocked video {
                    /* Force hardware decoding path */
                    transform: translateZ(0) scale(1.0001);
                    -webkit-transform: translateZ(0) scale(1.0001);
                    
                    /* Attempt to use protected media path */
                    -webkit-video-playable-inline: true;
                    
                    /* Force GPU layer */
                    will-change: transform, opacity;
                    
                    /* Block extraction */
                    object-fit: cover;
                    image-rendering: optimizeQuality;
                }
                
                /* Additional protection: overlay that appears on capture attempt */
                .screen-recording-blocked::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    background: transparent;
                    /* This becomes visible in some screen capture scenarios */
                    mix-blend-mode: difference;
                    z-index: 1;
                }
                
                /* Webkit hardware pipeline hint */
                @supports (-webkit-overflow-scrolling: touch) {
                    .screen-recording-blocked video {
                        -webkit-overflow-scrolling: touch;
                        -webkit-mask-image: -webkit-linear-gradient(white, white);
                    }
                }
                
                /* Flash animation for screenshot blocked overlay */
                @keyframes flash {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes pulse-border {
                    0%, 100% { border-color: #dc2626; }
                    50% { border-color: #fbbf24; }
                }
            `}</style>
        </div>
    );
}
