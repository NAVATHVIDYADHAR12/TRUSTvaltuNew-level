
const DB_NAME = 'SecureShareDB';
const STORE_NAME = 'protected_files';
const WALLET_STORE = 'user_wallet';
const TX_STORE = 'transactions';
const PURCHASES_STORE = 'purchases';
const DB_VERSION = 4; // Bump version for new stores
const CHANNEL_NAME = 'secure_share_updates';

export interface WalletTransaction {
    id: number;
    type: 'credit' | 'debit';
    title: string;
    amount: number;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface ProtectedFile {
    id: string;
    name: string;
    category: 'market' | 'vault';
    type: 'image' | 'video' | 'document';
    src: string;
    originalSrc: string | null;
    date: string;
    price: number;
    watermarkSettings?: {
        text: string;
        opacity: number;
        rotation: number;
        isRepeated: boolean;
    };
    drmSettings?: {
        blockRightClick: boolean;
        blockShortcuts: boolean;
        blockPrintScreen: boolean; // Added for PrintScreen key blocking
        antiScreenshot: boolean;
        tabFocusProtection: boolean;
        blockMediaRecorder: boolean;
        blockPiP: boolean;
        forensicWatermark: boolean;
        visualWatermark: boolean;
    };
}

export interface PurchaseRecord {
    fileId: string;
    date: string;
    price: number;
}

let cachedDB: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
    if (cachedDB) return Promise.resolve(cachedDB);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Files Store
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('category', 'category', { unique: false });
            }

            // Wallet Store (Single object for balance)
            if (!db.objectStoreNames.contains(WALLET_STORE)) {
                db.createObjectStore(WALLET_STORE, { keyPath: 'id' });
            }

            // Transactions Store
            if (!db.objectStoreNames.contains(TX_STORE)) {
                const txStore = db.createObjectStore(TX_STORE, { keyPath: 'id' });
                txStore.createIndex('date', 'date', { unique: false });
            }

            // Purchases Store
            if (!db.objectStoreNames.contains(PURCHASES_STORE)) {
                db.createObjectStore(PURCHASES_STORE, { keyPath: 'fileId' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            db.onclose = () => { cachedDB = null; };
            db.onversionchange = () => {
                db.close();
                cachedDB = null;
            };
            cachedDB = db;
            resolve(db);
        };
        request.onerror = () => reject(request.error);
    });
};

// Seed Data (with race condition prevention)
let seedingPromise: Promise<void> | null = null;

const seedMarketData = async () => {
    // If already seeding or seeded, return existing promise or resolve immediately
    if (seedingPromise) return seedingPromise;

    seedingPromise = (async () => {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME, WALLET_STORE], 'readwrite');

            // Seed Files
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('category');
            const countRequest = index.count('market');

            countRequest.onsuccess = () => {
                if (countRequest.result === 0) {
                    const mockMarketItems: ProtectedFile[] = [
                        {
                            id: 'mkt_1', name: 'Global Tech Trends 2025 Report', category: 'market', type: 'document',
                            src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
                            originalSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=100',
                            date: new Date().toISOString(), price: 299,
                            watermarkSettings: { text: "PREVIEW", opacity: 0.2, rotation: -45, isRepeated: true }
                        },
                        {
                            id: 'mkt_2', name: 'Smart Agri-IoT Blueprints', category: 'market', type: 'image',
                            src: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=800&q=60',
                            originalSrc: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1920&q=100',
                            date: new Date(Date.now() - 86400000).toISOString(), price: 150,
                            watermarkSettings: { text: "CONFIDENTIAL", opacity: 0.5, rotation: 0, isRepeated: false }
                        },
                        {
                            id: 'mkt_3', name: 'FinTech Algo Trading Strategy', category: 'market', type: 'document',
                            src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=60',
                            originalSrc: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=100',
                            date: new Date(Date.now() - 172800000).toISOString(), price: 500,
                            watermarkSettings: { text: "LICENSED", opacity: 0.3, rotation: -30, isRepeated: true }
                        },
                        {
                            id: 'mkt_4', name: 'Drone Surveillance Footage - Sample', category: 'market', type: 'video',
                            src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                            originalSrc: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
                            date: new Date().toISOString(), price: 120,
                            watermarkSettings: { text: "LICENSED FOOTAGE", opacity: 0.4, rotation: 0, isRepeated: true }
                        }
                    ];
                    mockMarketItems.forEach(item => store.add(item));
                }
            };

            // Seed Wallet ONLY if it doesn't exist
            const walletStore = transaction.objectStore(WALLET_STORE);
            const walletCheck = walletStore.get('main_wallet');
            walletCheck.onsuccess = () => {
                if (!walletCheck.result) {
                    walletStore.add({ id: 'main_wallet', balance: 3508 });
                    console.log("Seeded Wallet Data with initial balance: 3508");
                }
            };

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    })();

    return seedingPromise;
};

const notifySubscribers = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('secure-storage-update'));
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            ch.postMessage({ type: 'UPDATE' });
            ch.close();
        } catch (e) { /* ignore */ }
    }
};

export const db = {
    // --- FILES API ---

    async getAllMetadata(): Promise<ProtectedFile[]> {
        await seedMarketData();
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const files = request.result as ProtectedFile[];
                files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                resolve(files);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async getAllByCategory(category: 'market' | 'vault'): Promise<ProtectedFile[]> {
        await seedMarketData();
        const all = await this.getAllMetadata();
        return all.filter(f => f.category === category);
    },

    async getFile(id: string): Promise<ProtectedFile | undefined> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async add(file: ProtectedFile): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.add(file);
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    async update(file: ProtectedFile): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.put(file);
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    async delete(id: string): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.delete(id);
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    // --- WALLET API ---

    async getBalance(): Promise<number> {
        await seedMarketData();
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(WALLET_STORE, 'readonly');
            const store = transaction.objectStore(WALLET_STORE);
            const request = store.get('main_wallet');
            request.onsuccess = () => resolve(request.result?.balance || 0);
            request.onerror = () => reject(request.error);
        });
    },

    async updateBalance(newBalance: number): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(WALLET_STORE, 'readwrite');
            const store = transaction.objectStore(WALLET_STORE);
            store.put({ id: 'main_wallet', balance: newBalance });
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    async addTransaction(tx: Omit<WalletTransaction, 'id'>): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(TX_STORE, 'readwrite');
            const store = transaction.objectStore(TX_STORE);
            const fullTx = { ...tx, id: Date.now() }; // Simple unique ID
            store.add(fullTx);
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    async getTransactions(): Promise<WalletTransaction[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(TX_STORE, 'readonly');
            const store = transaction.objectStore(TX_STORE);
            const request = store.getAll();
            request.onsuccess = () => {
                const txs = request.result as WalletTransaction[];
                // Sort recent first
                txs.sort((a, b) => b.id - a.id);
                resolve(txs);
            };
            request.onerror = () => reject(request.error);
        });
    },

    // --- PURCHASES API ---

    async getPurchases(): Promise<string[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(PURCHASES_STORE, 'readonly');
            const store = transaction.objectStore(PURCHASES_STORE);
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result as string[]);
            request.onerror = () => reject(request.error);
        });
    },

    async addPurchase(record: PurchaseRecord): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(PURCHASES_STORE, 'readwrite');
            const store = transaction.objectStore(PURCHASES_STORE);
            store.put(record); // Use put to overwrite duplicates safely
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    // --- UTILS ---

    async clearAll(): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME, WALLET_STORE, TX_STORE, PURCHASES_STORE], 'readwrite');
            transaction.objectStore(STORE_NAME).clear();
            transaction.objectStore(WALLET_STORE).clear();
            transaction.objectStore(TX_STORE).clear();
            transaction.objectStore(PURCHASES_STORE).clear();
            transaction.oncomplete = () => {
                notifySubscribers();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    },

    subscribe(callback: () => void) {
        if (typeof window === 'undefined') return () => { };
        const eventHandler = () => callback();
        window.addEventListener('secure-storage-update', eventHandler);

        let ch: BroadcastChannel | null = null;
        try {
            ch = new BroadcastChannel(CHANNEL_NAME);
            ch.onmessage = (e) => {
                if (e.data?.type === 'UPDATE') callback();
            };
        } catch (e) { /* ignore */ }

        return () => {
            window.removeEventListener('secure-storage-update', eventHandler);
            if (ch) ch.close();
        };
    }
};
