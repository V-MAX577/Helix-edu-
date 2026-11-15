"use client";

import { useRef, useState } from "react";
import { exportDeviceData, importDeviceData } from "@/lib/device-store";

export function DeviceBackupControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadBackup() {
    setBusy(true);
    setStatus("");
    try {
      const backup = await exportDeviceData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `helixedu-device-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Backup exported. Keep the JSON file somewhere safe.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export device data.");
    } finally {
      setBusy(false);
    }
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      await importDeviceData(parsed);
      setStatus("Backup restored on this device. Refresh the page to reload saved progress.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not restore this backup.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="panel mt-6 p-5">
      <h2 className="text-lg font-bold">🗄️ Device data & backup</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Learner records are stored in this browser's IndexedDB. They are not synced to an account.
        Export a backup before clearing browser data or moving to another device.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={downloadBackup} disabled={busy}>
          {busy ? "Working…" : "Export backup"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          Import backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void restoreBackup(event.target.files?.[0])}
        />
      </div>
      {status && <p role="status" className="mt-3 text-xs text-[var(--text-muted)]">{status}</p>}
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Import replaces the HELIXEDU records in this browser with the records from the selected backup.
      </p>
    </section>
  );
}
