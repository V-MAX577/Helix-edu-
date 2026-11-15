/**
 * HELIXEDU device-only data store.
 *
 * Learner records live in this browser's IndexedDB. Nothing in this module
 * sends data to a server. Curriculum content remains bundled with the app.
 */
export const HELIXEDU_DB_NAME = "helixedu-device";
export const HELIXEDU_DB_VERSION = 1;

export const DEVICE_STORES = [
  "settings",
  "lessonProgress",
  "quizAttempts",
  "flashcardReviews",
  "notes",
  "bookmarks",
  "studyPlans",
  "reminders",
  "chatSessions",
  "chatMessages",
  "studyLog",
  "achievements",
] as const;

export type DeviceStoreName = (typeof DEVICE_STORES)[number];
export type DeviceRecord = { id: string; [key: string]: unknown };

const STORE_KEYS: Record<DeviceStoreName, string> = {
  settings: "id",
  lessonProgress: "id",
  quizAttempts: "id",
  flashcardReviews: "id",
  notes: "id",
  bookmarks: "id",
  studyPlans: "id",
  reminders: "id",
  chatSessions: "id",
  chatMessages: "id",
  studyLog: "id",
  achievements: "id",
};

let databasePromise: Promise<IDBDatabase> | undefined;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Device storage request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Device storage transaction aborted."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Device storage transaction failed."));
  });
}

export function openDeviceDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support local HELIXEDU storage."));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(HELIXEDU_DB_NAME, HELIXEDU_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const storeName of DEVICE_STORES) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: STORE_KEYS[storeName] });
          }
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          databasePromise = undefined;
        };
        resolve(db);
      };
      request.onerror = () => {
        databasePromise = undefined;
        reject(request.error ?? new Error("Could not open HELIXEDU device storage."));
      };
      request.onblocked = () => {
        databasePromise = undefined;
        reject(new Error("Close other HELIXEDU tabs to finish updating device storage."));
      };
    });
  }
  return databasePromise;
}

export async function getDeviceRecord<T extends DeviceRecord>(
  storeName: DeviceStoreName,
  id: string,
): Promise<T | undefined> {
  const db = await openDeviceDatabase();
  const tx = db.transaction(storeName, "readonly");
  const done = transactionDone(tx);
  const result = await requestResult(tx.objectStore(storeName).get(id)) as T | undefined;
  await done;
  return result;
}

export async function getAllDeviceRecords<T extends DeviceRecord>(
  storeName: DeviceStoreName,
): Promise<T[]> {
  const db = await openDeviceDatabase();
  const tx = db.transaction(storeName, "readonly");
  const done = transactionDone(tx);
  const result = await requestResult(tx.objectStore(storeName).getAll()) as T[];
  await done;
  return result;
}

export async function putDeviceRecord<T extends DeviceRecord>(
  storeName: DeviceStoreName,
  record: T,
): Promise<void> {
  const db = await openDeviceDatabase();
  const tx = db.transaction(storeName, "readwrite");
  const done = transactionDone(tx);
  tx.objectStore(storeName).put(record);
  await done;
}

export async function deleteDeviceRecord(
  storeName: DeviceStoreName,
  id: string,
): Promise<void> {
  const db = await openDeviceDatabase();
  const tx = db.transaction(storeName, "readwrite");
  const done = transactionDone(tx);
  tx.objectStore(storeName).delete(id);
  await done;
}

export type DeviceBackup = {
  format: "helixedu-device-backup";
  version: 1;
  exportedAt: string;
  stores: Partial<Record<DeviceStoreName, DeviceRecord[]>>;
};

/** Export all learner data as a portable JSON backup. */
export async function exportDeviceData(): Promise<DeviceBackup> {
  const stores: DeviceBackup["stores"] = {};
  for (const storeName of DEVICE_STORES) {
    stores[storeName] = await getAllDeviceRecords(storeName);
  }
  return {
    format: "helixedu-device-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    stores,
  };
}

/** Validate the backup shape before writing any imported learner records. */
export async function importDeviceData(input: unknown): Promise<void> {
  if (!input || typeof input !== "object") throw new Error("Backup file is not valid.");
  const backup = input as Partial<DeviceBackup>;
  if (backup.format !== "helixedu-device-backup" || backup.version !== 1 || !backup.stores) {
    throw new Error("This is not a supported HELIXEDU backup.");
  }

  for (const storeName of DEVICE_STORES) {
    const records = backup.stores[storeName];
    if (records !== undefined && (!Array.isArray(records) || records.some(
      (record) => !record || typeof record !== "object" || typeof record.id !== "string",
    ))) {
      throw new Error(`The ${storeName} section in this backup is invalid.`);
    }
  }

  const db = await openDeviceDatabase();
  const tx = db.transaction([...DEVICE_STORES], "readwrite");
  const done = transactionDone(tx);
  for (const storeName of DEVICE_STORES) {
    const records = backup.stores[storeName];
    // Backups may contain a subset of stores. Replace only sections explicitly
    // included so a partial backup cannot silently erase unrelated learner data.
    if (records === undefined) continue;
    const store = tx.objectStore(storeName);
    store.clear();
    for (const record of records) store.put(record);
  }
  await done;
}
