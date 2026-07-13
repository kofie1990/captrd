export interface FailedUpload {
  id: string;
  file: Blob;
  fileName: string;
  eventId: string;
  guestName: string;
  isVideo: boolean;
  timestamp: number;
}

const DB_NAME = "captrd_failed_uploads";
const STORE_NAME = "uploads";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Only run on client
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is not available on server"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
};

export const saveFailedUpload = async (upload: FailedUpload): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(upload);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to save failed upload to IndexedDB:", err);
  }
};

export const getFailedUploads = async (): Promise<FailedUpload[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to get failed uploads from IndexedDB:", err);
    return [];
  }
};

export const deleteFailedUpload = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to delete failed upload from IndexedDB:", err);
  }
};
