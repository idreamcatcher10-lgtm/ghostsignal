import type { StoredMessage } from './codec.js';
const DB = 'ghostsignal-v1';
const STORE = 'messages';
const FALLBACK = 'ghostsignal:messages';

let dbPromise: Promise<IDBDatabase> | null = null;
let useFallback = false;
function getDb(): Promise<IDBDatabase> {
  if (useFallback || typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'));
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch(e => { useFallback = true; throw e; });
  }
  return dbPromise!;
}
function fromLocal(): StoredMessage[] {
  try { return JSON.parse(localStorage.getItem(FALLBACK) || '[]') as StoredMessage[]; }
  catch { return []; }
}
function toLocal(messages: StoredMessage[]): void {
  localStorage.setItem(FALLBACK, JSON.stringify(messages));
}
export async function allMessages(): Promise<StoredMessage[]> {
  try {
    const db = await getDb();
    return await new Promise<StoredMessage[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as StoredMessage[]).sort((a, b) => b.receivedAt - a.receivedAt));
      req.onerror = () => reject(req.error);
    });
  } catch { return fromLocal().sort((a, b) => b.receivedAt - a.receivedAt); }
}
export async function putMessage(message: StoredMessage): Promise<void> {
  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(message);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const messages = fromLocal().filter(m => m.id !== message.id);
    messages.push(message);
    toLocal(messages);
  }
}
export async function deleteMessage(id: string): Promise<void> {
  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { toLocal(fromLocal().filter(m => m.id !== id)); }
}
export function getPreferredAlias(): string {
  try { return localStorage.getItem('ghostsignal:alias') || ''; }
  catch { return ''; }
}
export function setPreferredAlias(alias: string): void {
  try { localStorage.setItem('ghostsignal:alias', alias); }
  catch { /* private mode: ignore */ }
}
