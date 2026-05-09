import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Batch } from "@/lib/db";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BatchForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Batch>;
  onSubmit: (b: Omit<Batch, "id" | "createdAt">) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [startTime, setStart] = useState(initial?.startTime ?? "");
  const [endTime, setEnd] = useState(initial?.endTime ?? "");
  const [days, setDays] = useState<string[]>(initial?.days ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const toggle = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSubmit({ name: name.trim(), startTime, endTime, days, notes });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="bname">Batch name *</Label>
        <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Morning Beginners" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bstart">Start time</Label>
          <Input id="bstart" type="time" value={startTime} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bend">End time</Label>
          <Input id="bend" type="time" value={endTime} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Class days</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DAYS.map((d) => {
            const active = days.includes(d);
            return (
              <button
                type="button"
                key={d}
                onClick={() => toggle(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="bnotes">Notes</Label>
        <Textarea id="bnotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
