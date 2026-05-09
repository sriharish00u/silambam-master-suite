import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDB } from "@/lib/db";

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
function base64ToBlob(b64: string): Blob {
  const [meta, data] = b64.split(",");
  const type = /data:(.*?);/.exec(meta)?.[1] || "application/octet-stream";
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type });
}
async function serialiseRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Blob ? { __blob: await blobToBase64(v) } : v;
  }
  return out;
}
function deserialiseRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v && typeof v === "object" && (v as { __blob?: string }).__blob) {
      out[k] = base64ToBlob((v as { __blob: string }).__blob);
    } else out[k] = v;
  }
  return out;
}

const TABLES = ["batches", "students", "attendance", "achievements", "deleted", "settings"] as const;

export function BackupPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    setBusy(true);
    try {
      const db = getDB();
      const data: Record<string, unknown[]> = {};
      for (const t of TABLES) {
        const rows = await (db as unknown as Record<string, { toArray: () => Promise<Record<string, unknown>[]> }>)[t].toArray();
        data[t] = await Promise.all(rows.map(serialiseRow));
      }
      const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `silambam-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } finally {
      setBusy(false);
    }
  };

  const importAll = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed.data as Record<string, Record<string, unknown>[]>;
      const db = getDB();
      await db.transaction("rw", db.tables, async () => {
        for (const t of TABLES) {
          const table = (db as unknown as Record<string, { clear: () => Promise<void>; bulkAdd: (rows: unknown[]) => Promise<unknown> }>)[t];
          await table.clear();
          const rows = (data[t] ?? []).map(deserialiseRow);
          if (rows.length) await table.bulkAdd(rows);
        }
      });
      toast.success("Backup restored");
    } catch (e) {
      console.error(e);
      toast.error("Restore failed — invalid file?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Backup & Restore" description="Everything stays on this device." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold">Export</h3>
            <p className="text-sm text-muted-foreground">
              Download a single JSON file containing batches, students, attendance, achievements, photos and history.
            </p>
            <Button onClick={exportAll} disabled={busy}>
              <Download className="h-4 w-4 mr-1" /> Download backup
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold">Restore</h3>
            <p className="text-sm text-muted-foreground">
              Replaces all current data with the backup file's contents. Make sure to export first.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importAll(f);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4 mr-1" /> Restore from file
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
