
// IndexedDB helper for Chat History
const DB_NAME = 'CreatorSecureDB'; // Same DB as recordings to share versioning
const CHAT_STORE_NAME = 'chatHistory';
const DB_VERSION = 3; // Bump version for chat store

export interface ChatMessage {
    sender: 'user' | 'partner';
    text: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    partnerId: string;
    partnerName: string;
    date: string; // Formatted date string
    timestamp: number; // Raw timestamp for sorting
    messages: ChatMessage[];
    size: string; // Estimated size
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Ensure previous stores exist (from recordingsDB)
            if (!db.objectStoreNames.contains('zoomRecordings')) {
                db.createObjectStore('zoomRecordings', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('recycleBin')) {
                db.createObjectStore('recycleBin', { keyPath: 'id' });
            }

            // Create Chat History Store
            if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
                db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveChatSession = async (session: ChatSession): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CHAT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHAT_STORE_NAME);
        const request = store.put(session);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CHAT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(CHAT_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by timestamp descending (newest first)
            const sessions = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(sessions);
        };
        request.onerror = () => reject(request.error);
    });
};

export const deleteChatSession = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CHAT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHAT_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Calculate size string from messages (e.g., "1.2 KB")
export const calculateChatSize = (messages: ChatMessage[]): string => {
    const jsonString = JSON.stringify(messages);
    const bytes = new TextEncoder().encode(jsonString).length;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
};
