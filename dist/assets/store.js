const DB = 'ghostsignal-v1';
const STORE = 'messages';
const FALLBACK = 'ghostsignal:messages';
let dbPromise = null;
let useFallback = false;
function getDb() {
    if (useFallback || typeof indexedDB === 'undefined')
        return Promise.reject(new Error('IndexedDB unavailable'));
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB, 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains(STORE))
                    request.result.createObjectStore(STORE, { keyPath: 'id' });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(e => { useFallback = true; throw e; });
    }
    return dbPromise;
}
function fromLocal() {
    try {
        return JSON.parse(localStorage.getItem(FALLBACK) || '[]');
    }
    catch {
        return [];
    }
}
function toLocal(messages) {
    localStorage.setItem(FALLBACK, JSON.stringify(messages));
}
export async function allMessages() {
    try {
        const db = await getDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).getAll();
            req.onsuccess = () => resolve(req.result.sort((a, b) => b.receivedAt - a.receivedAt));
            req.onerror = () => reject(req.error);
        });
    }
    catch {
        return fromLocal().sort((a, b) => b.receivedAt - a.receivedAt);
    }
}
export async function putMessage(message) {
    try {
        const db = await getDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(message);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    catch {
        const messages = fromLocal().filter(m => m.id !== message.id);
        messages.push(message);
        toLocal(messages);
    }
}
export async function deleteMessage(id) {
    try {
        const db = await getDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    catch {
        toLocal(fromLocal().filter(m => m.id !== id));
    }
}
export function getPreferredAlias() {
    try {
        return localStorage.getItem('ghostsignal:alias') || '';
    }
    catch {
        return '';
    }
}
export function setPreferredAlias(alias) {
    try {
        localStorage.setItem('ghostsignal:alias', alias);
    }
    catch { /* private mode: ignore */ }
}
