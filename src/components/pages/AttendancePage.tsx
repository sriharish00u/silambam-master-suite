import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StudentAvatar } from "@/components/StudentAvatar";
import { batchRepo, studentRepo, attendanceRepo } from "@/lib/repos";
import type { AttendanceStatus } from "@/lib/db";

const LAST_BATCH_KEY = "silambam:lastBatch";

export function AttendancePage() {
  const batches = useLiveQuery(() => batchRepo.list(), []) ?? [];
  const [batchId, setBatchId] = useState<number | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, "yyyy-MM-dd");

  // Restore last-used batch
  useEffect(() => {
    if (batchId !== null || batches.length === 0) return;
    const last = Number(localStorage.getItem(LAST_BATCH_KEY));
    const found = batches.find((b) => b.id === last) ?? batches[0];
    if (found?.id) setBatchId(found.id);
  }, [batches, batchId]);

  const students =
    useLiveQuery(
      async () => (batchId ? await studentRepo.byBatch(batchId) : []),
      [batchId],
    ) ?? [];

  const existing = useLiveQuery(
    () => (batchId ? attendanceRepo.get(batchId, dateStr) : Promise.resolve(undefined)),
    [batchId, dateStr],
  );

  const [records, setRecords] = useState<Record<number, AttendanceStatus>>({});

  // Sync records when batch/date/students change. Default everyone present.
  useEffect(() => {
    if (!batchId) return;
    const next: Record<number, AttendanceStatus> = {};
    for (const s of students) {
      if (!s.id) continue;
      next[s.id] =
        existing?.records[s.id] ??
        (existing ? "absent" : "present"); // existing day with no record => assume absent? safer: present
      if (existing && existing.records[s.id] === undefined) next[s.id] = "present";
    }
    setRecords(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, dateStr, students.length, existing?.id]);

  const toggle = (sid: number) => {
    setRecords((r) => ({ ...r, [sid]: r[sid] === "present" ? "absent" : "present" }));
  };
  const allPresent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const s of students) if (s.id) next[s.id] = "present";
    setRecords(next);
  };
  const allAbsent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const s of students) if (s.id) next[s.id] = "absent";
    setRecords(next);
  };

  const counts = useMemo(() => {
    let p = 0,
      a = 0;
    for (const v of Object.values(records)) v === "present" ? p++ : a++;
    return { p, a };
  }, [records]);

  const save = async () => {
    if (!batchId) return;
    await attendanceRepo.upsert(batchId, dateStr, records);
    localStorage.setItem(LAST_BATCH_KEY, String(batchId));
    toast.success(`Saved attendance for ${format(date, "PP")}`);
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Tap a student to toggle present / absent. All start as present."
      />

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Select
              value={batchId ? String(batchId) : ""}
              onValueChange={(v) => setBatchId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(date, "PP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={save} disabled={!batchId || students.length === 0}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </CardContent>
      </Card>

      {batchId && students.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">
            {counts.p} present
          </span>
          <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
            {counts.a} absent
          </span>
          <span className="text-muted-foreground">of {students.length}</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="ghost" onClick={allPresent}>
              All present
            </Button>
            <Button size="sm" variant="ghost" onClick={allAbsent}>
              All absent
            </Button>
          </div>
        </div>
      )}

      {!batchId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a batch to start.
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No students in this batch.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {students.map((s) => {
            const status = records[s.id!] ?? "present";
            const present = status === "present";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id!)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition active:scale-[0.99]",
                  present
                    ? "border-success/40 bg-success/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
              >
                <StudentAvatar student={s} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{s.name}</div>
                  {s.beltLevel && (
                    <div className="text-xs text-muted-foreground">{s.beltLevel}</div>
                  )}
                </div>
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center font-semibold",
                    present
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {present ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
