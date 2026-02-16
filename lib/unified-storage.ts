/**
 * Unified Storage Router
 * 
 * Intelligently routes storage operations across 3 tiers:
 * - TIER 1: IndexedDB (offline, demo, single-user)
 * - TIER 2: PostgreSQL via API (licensed small files < 5MB)
 * - TIER 3: External URLs (large files, CDN)
 */

import { db as indexedDb, ProtectedFile } from './secure-storage';

// Storage tier types
export type StorageTier = 'indexeddb' | 'postgresql' | 'external';

// 5MB threshold for PostgreSQL storage
const MAX_POSTGRES_SIZE = 5 * 1024 * 1024;

// Check if we're online
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

// Check if PostgreSQL backend is available
const isBackendAvailable = async (): Promise<boolean> => {
    if (!isOnline()) return false;
    try {
        const res = await fetch('/api/files?limit=1', { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
};

// Determine storage tier for a file
export function getStorageTier(file: {
    size?: number;
    isPurchased?: boolean;
    externalUrl?: string | null;
}): StorageTier {
    // Offline → IndexedDB only
    if (!isOnline()) return 'indexeddb';

    // Has external URL → use CDN
    if (file.externalUrl) return 'external';

    // Small licensed files → PostgreSQL
    if (file.size && file.size < MAX_POSTGRES_SIZE && file.isPurchased) {
        return 'postgresql';
    }

    // Default: IndexedDB (demo/local)
    return 'indexeddb';
}

// Unified storage interface
export const unifiedStorage = {
    /**
     * Get all files (metadata only - fast)
     */
    async getAllFiles(category: 'market' | 'vault' = 'market'): Promise<ProtectedFile[]> {
        // Try PostgreSQL first if online
        if (await isBackendAvailable()) {
            try {
                const res = await fetch(`/api/files?category=${category}`);
                if (res.ok) {
                    const data = await res.json();
                    return data.files;
                }
            } catch (e) {
                console.warn('PostgreSQL fetch failed, falling back to IndexedDB', e);
            }
        }

        // Fallback to IndexedDB
        return category === 'market'
            ? indexedDb.getAllByCategory('market')
            : indexedDb.getAllByCategory('vault');
    },

    /**
     * Get single file with content (lazy loaded)
     */
    async getFileWithContent(id: string, isPurchased = false): Promise<{
        file: ProtectedFile | null;
        content: { preview: string | null; original: string | null } | null;
    }> {
        const tier = getStorageTier({ isPurchased });

        if (tier === 'postgresql' && await isBackendAvailable()) {
            try {
                const res = await fetch(`/api/files/${id}?content=true`);
                if (res.ok) {
                    const data = await res.json();
                    return {
                        file: data.file,
                        content: data.content ? {
                            preview: data.content.preview_data,
                            original: data.content.original_data
                        } : null
                    };
                }
            } catch (e) {
                console.warn('PostgreSQL fetch failed, falling back to IndexedDB', e);
            }
        }

        // Fallback to IndexedDB
        const file = await indexedDb.getFile(id);
        return {
            file: file || null,
            content: file ? { preview: file.src, original: file.originalSrc } : null
        };
    },

    /**
     * Save a file (routes to appropriate tier)
     */
    async saveFile(file: Omit<ProtectedFile, 'id'> & { id?: string }): Promise<ProtectedFile> {
        const fileSize = file.src?.length || 0;
        const tier = getStorageTier({ size: fileSize, isPurchased: false });

        // Always save to IndexedDB for offline access
        const savedToIndexed = await this._saveToIndexedDB(file);

        // If online and small enough, also sync to PostgreSQL
        if (tier !== 'indexeddb' && fileSize < MAX_POSTGRES_SIZE && await isBackendAvailable()) {
            try {
                await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        type: file.type,
                        category: file.category,
                        price: file.price,
                        watermark: file.watermarkSettings,
                        drmSettings: file.drmSettings,
                        previewData: file.src,
                        originalData: file.originalSrc
                    })
                });
            } catch (e) {
                console.warn('PostgreSQL sync failed, but IndexedDB saved', e);
            }
        }

        return savedToIndexed;
    },

    /**
     * Delete a file from all tiers
     */
    async deleteFile(id: string): Promise<boolean> {
        let success = false;

        // Delete from IndexedDB
        try {
            await indexedDb.delete(id);
            success = true;
        } catch (e) {
            console.error('IndexedDB delete failed', e);
        }

        // Also delete from PostgreSQL if online
        if (await isBackendAvailable()) {
            try {
                await fetch(`/api/files/${id}`, { method: 'DELETE' });
            } catch (e) {
                console.warn('PostgreSQL delete failed', e);
            }
        }

        return success;
    },

    /**
     * Update file metadata
     */
    async updateFile(file: ProtectedFile): Promise<ProtectedFile> {
        // Update IndexedDB
        await indexedDb.update(file);

        // Sync to PostgreSQL if online
        if (await isBackendAvailable()) {
            try {
                await fetch(`/api/files/${file.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        category: file.category,
                        price: file.price
                    })
                });
            } catch (e) {
                console.warn('PostgreSQL update failed', e);
            }
        }

        return file;
    },

    // Internal: Save to IndexedDB
    async _saveToIndexedDB(file: Omit<ProtectedFile, 'id'> & { id?: string }): Promise<ProtectedFile> {
        const newFile: ProtectedFile = {
            ...file,
            id: file.id || crypto.randomUUID(),
            category: file.category || 'vault'
        } as ProtectedFile;

        await indexedDb.add(newFile);
        return newFile;
    },

    // Subscribe to changes (IndexedDB events + polling for PostgreSQL)
    subscribe(callback: () => void) {
        return indexedDb.subscribe(callback);
    }
};

export default unifiedStorage;
