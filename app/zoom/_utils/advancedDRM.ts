// Advanced DRM Protection System
// Maximum web-based protection without enterprise licensing

export interface DRMConfig {
    userId?: string;
    sessionId?: string;
    enableForensicWatermark: boolean;
    enableMediaRecorderBlock: boolean;
    enablePiPBlock: boolean;
    enableDevToolsDetection: boolean;
    enableCanvasProtection: boolean;
    enableHeartbeat: boolean;
}

// Generate unique session fingerprint
export const generateSessionFingerprint = (): string => {
    const nav = navigator;
    const screen = window.screen;

    const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || 0,
        // @ts-ignore
        nav.deviceMemory || 0,
        Date.now().toString(36)
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(36).toUpperCase();
};

// Invisible Forensic Watermark - encodes user ID in video frames
export class ForensicWatermark {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private userId: string;
    private pattern: number[];

    constructor(userId: string) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.userId = userId;
        this.pattern = this.generatePattern();
    }

    private generatePattern(): number[] {
        // Convert userId to binary pattern
        const pattern: number[] = [];
        for (let i = 0; i < this.userId.length; i++) {
            const code = this.userId.charCodeAt(i);
            for (let j = 7; j >= 0; j--) {
                pattern.push((code >> j) & 1);
            }
        }
        return pattern;
    }

    // Create invisible watermark overlay
    createWatermarkOverlay(width: number, height: number): HTMLCanvasElement {
        if (width <= 0 || height <= 0) return this.canvas;

        this.canvas.width = width;
        this.canvas.height = height;

        // Create nearly invisible pattern
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        let patternIndex = 0;
        for (let y = 0; y < height; y += 8) {
            for (let x = 0; x < width; x += 8) {
                const bit = this.pattern[patternIndex % this.pattern.length];
                patternIndex++;

                // Modify single pixel with minimal visible change
                const idx = (y * width + x) * 4;
                if (bit === 1) {
                    data[idx] = 1; // R - barely visible
                    data[idx + 3] = 2; // Alpha - nearly transparent
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
        return this.canvas;
    }

    // Extract watermark from captured image (for verification)
    static extractWatermark(imageData: ImageData): string {
        const data = imageData.data;
        const bits: number[] = [];

        for (let y = 0; y < imageData.height; y += 8) {
            for (let x = 0; x < imageData.width; x += 8) {
                const idx = (y * imageData.width + x) * 4;
                bits.push(data[idx] > 0 ? 1 : 0);
            }
        }

        // Convert bits back to string
        let result = '';
        for (let i = 0; i < bits.length; i += 8) {
            let code = 0;
            for (let j = 0; j < 8 && i + j < bits.length; j++) {
                code = (code << 1) | bits[i + j];
            }
            if (code > 0 && code < 128) {
                result += String.fromCharCode(code);
            }
        }

        return result;
    }
}

// MediaRecorder Blocking - prevents browser recording APIs
export const blockMediaRecorder = (): void => {
    if (typeof window === 'undefined') return;

    const originalMediaRecorder = window.MediaRecorder;

    // Override MediaRecorder constructor
    // @ts-ignore
    window.MediaRecorder = function (stream: MediaStream, options?: MediaRecorderOptions) {
        console.warn('🔒 DRM: MediaRecorder blocked by content protection');

        // Trigger DRM violation event
        window.dispatchEvent(new CustomEvent('drmViolation', {
            detail: { type: 'mediaRecorder', timestamp: Date.now() }
        }));

        // Return a dummy recorder that does nothing
        return {
            start: () => console.warn('DRM: Recording blocked'),
            stop: () => { },
            pause: () => { },
            resume: () => { },
            ondataavailable: null,
            onerror: null,
            onstart: null,
            onstop: null,
            state: 'inactive',
            stream: null,
            mimeType: '',
            videoBitsPerSecond: 0,
            audioBitsPerSecond: 0
        };
    };

    // Copy static properties
    // @ts-ignore
    window.MediaRecorder.isTypeSupported = originalMediaRecorder.isTypeSupported;
};

// Picture-in-Picture Blocking
export const blockPictureInPicture = (videoElement: HTMLVideoElement): void => {
    if (!videoElement) return;

    // Disable PiP on the element
    videoElement.disablePictureInPicture = true;

    // Override requestPictureInPicture
    videoElement.requestPictureInPicture = async () => {
        console.warn('🔒 DRM: Picture-in-Picture blocked');
        window.dispatchEvent(new CustomEvent('drmViolation', {
            detail: { type: 'pip', timestamp: Date.now() }
        }));
        throw new DOMException('PiP disabled by DRM', 'NotAllowedError');
    };

    // Listen for PiP events
    videoElement.addEventListener('enterpictureinpicture', (e) => {
        e.preventDefault();
        document.exitPictureInPicture?.();
    });
};

// Enhanced DevTools Detection
export class DevToolsDetector {
    private isOpen: boolean = false;
    private callbacks: Array<(isOpen: boolean) => void> = [];
    private threshold: number = 160;

    constructor() {
        this.startDetection();
    }

    private startDetection(): void {
        // Method 1: Window size difference
        const checkWindowSize = () => {
            const widthDiff = window.outerWidth - window.innerWidth > this.threshold;
            const heightDiff = window.outerHeight - window.innerHeight > this.threshold;

            if (widthDiff || heightDiff) {
                this.triggerOpen();
            }
        };

        // Method 2: Console timing attack
        const checkConsole = () => {
            const start = performance.now();
            // @ts-ignore - Using deprecated console feature for detection
            console.profile?.('devtools-check');
            // @ts-ignore
            console.profileEnd?.('devtools-check');
            const duration = performance.now() - start;

            if (duration > 10) {
                this.triggerOpen();
            }
        };

        // Method 3: Debugger statement timing
        const checkDebugger = () => {
            const start = Date.now();
            // This will pause if devtools is open with breakpoints
            // eslint-disable-next-line no-debugger
            debugger;
            const duration = Date.now() - start;

            if (duration > 100) {
                this.triggerOpen();
            }
        };

        // Method 4: toString override detection
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                this.triggerOpen();
                return '';
            }
        });

        // Run checks periodically
        setInterval(() => {
            checkWindowSize();
        }, 1000);

        // Console check (less frequent)
        setInterval(checkConsole, 5000);
    }

    private triggerOpen(): void {
        if (!this.isOpen) {
            this.isOpen = true;
            this.callbacks.forEach(cb => cb(true));

            window.dispatchEvent(new CustomEvent('drmViolation', {
                detail: { type: 'devtools', timestamp: Date.now() }
            }));
        }
    }

    onDevToolsChange(callback: (isOpen: boolean) => void): void {
        this.callbacks.push(callback);
    }
}

// Canvas Protection - GPU-accelerated protection layer
export const createProtectionOverlay = (container: HTMLElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.001;
    `;

    const ctx = canvas.getContext('2d', {
        willReadFrequently: false,
        alpha: true
    });

    if (ctx) {
        // Create complex pattern that disrupts compression
        const updatePattern = () => {
            if (container.clientWidth <= 0 || container.clientHeight <= 0) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Random noise pattern (invisible but disrupts encoding)
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.random() > 0.5 ? 1 : 0;
                data[i + 1] = Math.random() > 0.5 ? 1 : 0;
                data[i + 2] = Math.random() > 0.5 ? 1 : 0;
                data[i + 3] = 1; // Very low alpha
            }

            ctx.putImageData(imageData, 0, 0);
        };

        // Update occasionally to disrupt recording
        updatePattern();
        setInterval(updatePattern, 100);
    }

    container.appendChild(canvas);
    return canvas;
};

// Heartbeat System - detects tampering
export class DRMHeartbeat {
    private intervalId: NodeJS.Timeout | null = null;
    private lastCheck: number = Date.now();
    private missedBeats: number = 0;
    private onViolation: () => void;

    constructor(onViolation: () => void) {
        this.onViolation = onViolation;
    }

    start(intervalMs: number = 1000): void {
        this.intervalId = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.lastCheck;

            // If more than 3x the interval has passed, likely debugging/tampering
            if (elapsed > intervalMs * 3) {
                this.missedBeats++;
                console.warn(`🔒 DRM: Heartbeat irregularity detected (${this.missedBeats})`);

                if (this.missedBeats >= 3) {
                    this.onViolation();
                    window.dispatchEvent(new CustomEvent('drmViolation', {
                        detail: { type: 'heartbeat', timestamp: Date.now() }
                    }));
                }
            } else {
                this.missedBeats = 0;
            }

            this.lastCheck = now;
        }, intervalMs);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Visibility API Enhancement
export class VisibilityMonitor {
    private onHidden: () => void;
    private onVisible: () => void;
    private hiddenTime: number = 0;
    private suspiciousHides: number = 0;

    constructor(onHidden: () => void, onVisible: () => void) {
        this.onHidden = onHidden;
        this.onVisible = onVisible;
        this.startMonitoring();
    }

    private startMonitoring(): void {
        // Standard visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.hiddenTime = Date.now();
                this.onHidden();
            } else {
                const hiddenDuration = Date.now() - this.hiddenTime;

                // Quick hide/show is suspicious (screenshot tools)
                if (hiddenDuration < 500 && hiddenDuration > 0) {
                    this.suspiciousHides++;
                    if (this.suspiciousHides >= 3) {
                        window.dispatchEvent(new CustomEvent('drmViolation', {
                            detail: { type: 'visibility', timestamp: Date.now() }
                        }));
                    }
                }

                this.onVisible();
            }
        });

        // Window blur detection
        window.addEventListener('blur', () => {
            this.onHidden();
        });

        window.addEventListener('focus', () => {
            this.onVisible();
        });

        // Page hide (mobile/tab switching)
        window.addEventListener('pagehide', () => {
            this.onHidden();
        });

        window.addEventListener('pageshow', () => {
            this.onVisible();
        });
    }
}

// Screen Capture API Detection
export const detectScreenCapture = async (): Promise<boolean> => {
    try {
        // Check if screen capture is active
        const permissionStatus = await navigator.permissions.query({
            name: 'display-capture' as PermissionName
        });

        if (permissionStatus.state === 'granted') {
            console.warn('🔒 DRM: Screen capture permission detected');
            return true;
        }
    } catch (e) {
        // Not supported
    }

    return false;
};

// Block getDisplayMedia (screen sharing of protected content)
export const blockGetDisplayMedia = (): void => {
    if (typeof navigator === 'undefined') return;

    const original = navigator.mediaDevices?.getDisplayMedia;
    if (original && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = async (constraints?: DisplayMediaStreamOptions) => {
            console.warn('🔒 DRM: getDisplayMedia intercepted');

            // Allow but track
            window.dispatchEvent(new CustomEvent('drmViolation', {
                detail: { type: 'displayMedia', timestamp: Date.now() }
            }));

            // Still allow for legitimate use but log it
            return original.call(navigator.mediaDevices, constraints);
        };
    }
};

// Initialize all DRM protections
export const initAdvancedDRM = (config: DRMConfig): {
    fingerprint: string;
    cleanup: () => void;
} => {
    const fingerprint = generateSessionFingerprint();
    const cleanupFunctions: Array<() => void> = [];

    console.log('🔒 Advanced DRM Protection Initializing...');
    console.log(`🔒 Session Fingerprint: ${fingerprint}`);

    if (config.enableMediaRecorderBlock) {
        blockMediaRecorder();
        console.log('✓ MediaRecorder blocking enabled');
    }

    if (config.enableDevToolsDetection) {
        const detector = new DevToolsDetector();
        detector.onDevToolsChange((isOpen) => {
            if (isOpen) {
                console.warn('🔒 DevTools detected - DRM violation logged');
            }
        });
        console.log('✓ DevTools detection enabled');
    }

    if (config.enableHeartbeat) {
        const heartbeat = new DRMHeartbeat(() => {
            console.warn('🔒 DRM Heartbeat violation');
        });
        heartbeat.start();
        cleanupFunctions.push(() => heartbeat.stop());
        console.log('✓ Heartbeat monitoring enabled');
    }

    blockGetDisplayMedia();
    console.log('✓ Display media tracking enabled');

    // Track all violations
    window.addEventListener('drmViolation', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        console.warn(`🚨 DRM VIOLATION: ${detail.type} at ${new Date(detail.timestamp).toISOString()}`);

        // Could send to server for logging
        // fetch('/api/drm-violation', { method: 'POST', body: JSON.stringify(detail) });
    });

    console.log('🔒 Advanced DRM Protection Active!');

    return {
        fingerprint,
        cleanup: () => {
            cleanupFunctions.forEach(fn => fn());
        }
    };
};
