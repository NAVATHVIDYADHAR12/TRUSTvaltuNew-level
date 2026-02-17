// IndexedDB helper for Zoom recordings with Recycle Bin support
const DB_NAME = 'CreatorSecureDB';
const STORE_NAME = 'zoomRecordings';
const TRASH_STORE_NAME = 'recycleBin';
const DB_VERSION = 3; // Bump to match ChatDB

export interface ZoomRecording {
    id: string;
    roomId: string;
    date: string;
    duration: string;
    size: string;
    blob: Blob;
    timestamp: number;
    deletedAt?: number; // Timestamp when moved to trash
}

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            // Add Recycle Bin store
            if (!db.objectStoreNames.contains(TRASH_STORE_NAME)) {
                db.createObjectStore(TRASH_STORE_NAME, { keyPath: 'id' });
            }
            // Add Chat History store (ensure compatibility with chatDB)
            if (!db.objectStoreNames.contains('chatHistory')) {
                db.createObjectStore('chatHistory', { keyPath: 'id' });
            }
        };
    });
};

export const saveRecording = async (recording: ZoomRecording): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(recording);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAllRecordings = async (): Promise<ZoomRecording[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const recordings = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(recordings);
        };
        request.onerror = () => reject(request.error);
    });
};

export const getRecordingById = async (id: string): Promise<ZoomRecording | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Move to Recycle Bin instead of permanent delete
export const moveToTrash = async (id: string): Promise<void> => {
    const db = await openDB();

    // Get the recording first
    const recording = await getRecordingById(id);
    if (!recording) return;

    // Add deletedAt timestamp
    const trashRecording: ZoomRecording = {
        ...recording,
        deletedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME, TRASH_STORE_NAME], 'readwrite');
        const mainStore = transaction.objectStore(STORE_NAME);
        const trashStore = transaction.objectStore(TRASH_STORE_NAME);

        // Add to trash
        trashStore.put(trashRecording);
        // Remove from main store
        mainStore.delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

// Get all recordings from Recycle Bin
export const getTrashRecordings = async (): Promise<ZoomRecording[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(TRASH_STORE_NAME, 'readonly');
        const store = transaction.objectStore(TRASH_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const recordings = request.result.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
            resolve(recordings);
        };
        request.onerror = () => reject(request.error);
    });
};

// Restore from Recycle Bin
export const restoreFromTrash = async (id: string): Promise<void> => {
    const db = await openDB();

    return new Promise(async (resolve, reject) => {
        const getTransaction = db.transaction(TRASH_STORE_NAME, 'readonly');
        const trashStore = getTransaction.objectStore(TRASH_STORE_NAME);
        const getRequest = trashStore.get(id);

        getRequest.onsuccess = () => {
            const recording = getRequest.result;
            if (!recording) {
                reject(new Error('Recording not found in trash'));
                return;
            }

            // Remove deletedAt and restore
            delete recording.deletedAt;

            const writeTransaction = db.transaction([STORE_NAME, TRASH_STORE_NAME], 'readwrite');
            const mainStore = writeTransaction.objectStore(STORE_NAME);
            const trashWriteStore = writeTransaction.objectStore(TRASH_STORE_NAME);

            // Add back to main store
            mainStore.put(recording);
            // Remove from trash
            trashWriteStore.delete(id);

            writeTransaction.oncomplete = () => resolve();
            writeTransaction.onerror = () => reject(writeTransaction.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

// Permanently delete from Recycle Bin
export const permanentlyDelete = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(TRASH_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(TRASH_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Empty entire Recycle Bin
export const emptyTrash = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(TRASH_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(TRASH_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Legacy delete function (now uses moveToTrash)
export const deleteRecording = async (id: string): Promise<void> => {
    return moveToTrash(id);
};
