import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trophy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { achievementRepo, studentRepo } from "@/lib/repos";
import { compressImage } from "@/lib/image";
import { useBlobURL } from "@/hooks/use-blob-url";
import type { Achievement } from "@/lib/db";

export function AchievementsPage() {
  const items = useLiveQuery(() => achievementRepo.list(), []) ?? [];
  const students = useLiveQuery(() => studentRepo.list(), []) ?? [];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Achievements"
        description="Tournament wins, belt promotions, awards"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record achievement</DialogTitle>
              </DialogHeader>
              <AchievementForm
                students={students}
                onClose={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-50" />
            No achievements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {items.map((a) => (
            <AchievementCard key={a.id} a={a} students={students} />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementCard({
  a,
  students,
}: {
  a: Achievement;
  students: { id?: number; name: string }[];
}) {
  const url = useBlobURL(a.image);
  const student = students.find((s) => s.id === a.studentId);
  return (
    <Card>
      <CardContent className="p-3 flex gap-3 items-start">
        {url ? (
          <img src={url} alt={a.title} className="h-16 w-16 rounded object-cover" />
        ) : (
          <div className="h-16 w-16 rounded bg-accent/30 flex items-center justify-center">
            <Trophy className="h-7 w-7 text-accent-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{a.title}</div>
          <div className="text-xs text-muted-foreground">
            {student?.name ?? "Unknown"} · {format(new Date(a.date), "PP")}
          </div>
          {a.description && <p className="text-sm mt-1">{a.description}</p>}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={async () => {
            await achievementRepo.remove(a.id!);
            toast.success("Deleted");
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}

function AchievementForm({
  students,
  onClose,
}: {
  students: { id?: number; name: string }[];
  onClose: () => void;
}) {
  const [studentId, setStudentId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [image, setImage] = useState<Blob | undefined>();

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!studentId || !title.trim()) return;
        await achievementRepo.add({
          studentId: Number(studentId),
          title: title.trim(),
          description,
          date,
          image,
        });
        toast.success("Achievement added");
        onClose();
      }}
    >
      <div>
        <Label>Student *</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="atitle">Title *</Label>
        <Input id="atitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="adate">Date</Label>
        <Input id="adate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="adesc">Description</Label>
        <Textarea id="adesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div>
        <Label htmlFor="aimg">Image</Label>
        <Input
          id="aimg"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setImage(await compressImage(f, 900));
          }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
