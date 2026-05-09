import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, ArrowLeft, Trash2, Pencil, CalendarCheck } from "lucide-react";
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
import { StudentForm } from "@/components/StudentForm";
import { batchRepo, studentRepo } from "@/lib/repos";
import type { Student } from "@/lib/db";
import { StudentAvatar } from "@/components/StudentAvatar";

export function BatchDetailPage({ batchId }: { batchId: number }) {
  const batch = useLiveQuery(() => batchRepo.get(batchId), [batchId]);
  const students = useLiveQuery(() => studentRepo.byBatch(batchId), [batchId]) ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  if (!batch) {
    return (
      <div>
        <Link to="/batches" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="mt-4">Batch not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/batches" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-2">
        <ArrowLeft className="h-3.5 w-3.5" /> All batches
      </Link>
      <PageHeader
        title={batch.name}
        description={`${batch.startTime || ""}${batch.endTime ? " – " + batch.endTime : ""}${batch.days?.length ? " · " + batch.days.join(", ") : ""}`}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/attendance" search={{ batchId } as never}>
                <CalendarCheck className="h-4 w-4 mr-1" /> Attendance
              </Link>
            </Button>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) setEditing(null);
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)}>
                  <Plus className="h-4 w-4 mr-1" /> Add student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit student" : "New student"}</DialogTitle>
                </DialogHeader>
                <StudentForm
                  initial={editing ?? undefined}
                  batchId={batchId}
                  onCancel={() => setOpen(false)}
                  onSubmit={async (s) => {
                    if (editing?.id) {
                      await studentRepo.update(editing.id, s);
                      toast.success("Student updated");
                    } else {
                      await studentRepo.add(s);
                      toast.success("Student added");
                    }
                    setOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No students in this batch yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {students.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <StudentAvatar student={s} size={44} />
                <div className="flex-1 min-w-0">
                  <Link
                    to="/students/$id"
                    params={{ id: String(s.id) }}
                    className="font-medium hover:underline"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-muted-foreground truncate">
                    {[s.age && `Age ${s.age}`, s.beltLevel, s.phone].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(s);
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
                      <AlertDialogTitle>Delete student?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{s.name}" will move to History. You can restore them later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await studentRepo.remove(s.id!);
                          toast.success("Moved to history");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
