import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Users, Clock, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BatchForm } from "@/components/BatchForm";
import { batchRepo, studentRepo } from "@/lib/repos";
import type { Batch } from "@/lib/db";

export function BatchesPage() {
  const batches = useLiveQuery(() => batchRepo.list(), []) ?? [];
  const studentCounts = (useLiveQuery(
    async () => {
      const all = await studentRepo.list();
      const map: Record<number, number> = {};
      for (const s of all) map[s.batchId] = (map[s.batchId] ?? 0) + 1;
      return map;
    },
    [],
  ) ?? {}) as Record<number, number>;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);

  return (
    <div>
      <PageHeader
        title="Batches"
        description="Organise students into training groups"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="h-4 w-4 mr-1" /> New batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit batch" : "New batch"}</DialogTitle>
              </DialogHeader>
              <BatchForm
                initial={editing ?? undefined}
                onCancel={() => setOpen(false)}
                onSubmit={async (b) => {
                  if (editing?.id) {
                    await batchRepo.update(editing.id, b);
                    toast.success("Batch updated");
                  } else {
                    await batchRepo.add(b);
                    toast.success("Batch created");
                  }
                  setOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {batches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No batches yet. Create your first batch to start adding students.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <Card key={b.id} className="overflow-hidden hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/batches/$id"
                    params={{ id: String(b.id) }}
                    className="font-semibold text-lg hover:underline"
                  >
                    {b.name}
                  </Link>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(b);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete batch?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{b.name}" and its {studentCounts[b.id!] ?? 0} students will move to History. You can restore them later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await batchRepo.remove(b.id!);
                              toast.success("Moved to history");
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  {(b.startTime || b.endTime) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {b.startTime || "?"} – {b.endTime || "?"}
                    </div>
                  )}
                  {b.days?.length > 0 && <div>{b.days.join(" · ")}</div>}
                  <div className="flex items-center gap-1 pt-1">
                    <Users className="h-3.5 w-3.5" />
                    {studentCounts[b.id!] ?? 0} students
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
