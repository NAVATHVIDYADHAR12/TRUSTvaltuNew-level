"use client";

import { useEffect, useState } from 'react';

/**
 * GlobalDRMProtection - Applies DRM settings from GlobalNavbar to ALL pages
 * Listens for real-time changes via localStorage and drmSettingsChanged event
 */
export default function GlobalDRMProtection() {
    const [drmSettings, setDrmSettings] = useState({
        rightClickDisable: false,
        screenshotBlocking: false,
        devToolsDetection: false
    });

    useEffect(() => {
        // Load settings from localStorage
        const loadSettings = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('drmSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    setDrmSettings({
                        rightClickDisable: settings.rightClickDisable || false,
                        screenshotBlocking: settings.screenshotBlocking || false,
                        devToolsDetection: settings.devToolsDetection || false
                    });
                }
            }
        };

        loadSettings();

        // Listen for real-time changes
        window.addEventListener('storage', loadSettings);
        window.addEventListener('drmSettingsChanged', loadSettings);

        return () => {
            window.removeEventListener('storage', loadSettings);
            window.removeEventListener('drmSettingsChanged', loadSettings);
        };
    }, []);

    useEffect(() => {
        // Right-Click Protection
        const handleContextMenu = (e: MouseEvent) => {
            if (drmSettings.rightClickDisable) {
                e.preventDefault();
                console.log('🔒 Right-click disabled by DRM settings');
            }
        };

        // Screenshot Protection
        const handleKeyDown = (e: KeyboardEvent) => {
            if (drmSettings.screenshotBlocking) {
                const isScreenshotAttempt =
                    e.key === 'PrintScreen' ||
                    (e.key === 'S' && e.shiftKey && (e.metaKey || e.getModifierState('Meta'))) ||
                    (e.key === 's' && e.shiftKey && e.ctrlKey) ||
                    (e.key === 'Print') ||
                    (e.key === '3' && e.metaKey && e.shiftKey) ||
                    (e.key === '4' && e.metaKey && e.shiftKey) ||
                    (e.key === '5' && e.metaKey && e.shiftKey);

                if (isScreenshotAttempt) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔒 Screenshot attempt blocked by DRM settings');
                }
            }

            // DevTools Protection
            if (drmSettings.devToolsDetection) {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    console.log('🔒 DevTools blocked by DRM settings');
                }
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [drmSettings]);

    return null; // This component doesn't render anything
}
