import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Calendar, Phone, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAvatar } from "@/components/StudentAvatar";
import { studentRepo, attendanceRepo, achievementRepo, batchRepo } from "@/lib/repos";
import { useBlobURL } from "@/hooks/use-blob-url";

export function StudentProfilePage({ studentId }: { studentId: number }) {
  const student = useLiveQuery(() => studentRepo.get(studentId), [studentId]);
  const batch = useLiveQuery(
    async () => (student ? await batchRepo.get(student.batchId) : undefined),
    [student?.batchId],
  );
  const attendance = useLiveQuery(() => attendanceRepo.byStudent(studentId), [studentId]) ?? [];
  const achievements = useLiveQuery(() => achievementRepo.byStudent(studentId), [studentId]) ?? [];

  if (!student) {
    return (
      <div>
        <Link to="/batches" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="mt-4">Student not found.</p>
      </div>
    );
  }

  let present = 0,
    absent = 0;
  for (const r of attendance) {
    const s = r.records[studentId];
    if (s === "present") present++;
    else if (s === "absent") absent++;
  }
  const total = present + absent;
  const pct = total ? Math.round((present / total) * 100) : 0;

  return (
    <div>
      {batch && (
        <Link
          to="/batches/$id"
          params={{ id: String(batch.id) }}
          className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {batch.name}
        </Link>
      )}
      <PageHeader title={student.name} description={batch?.name} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-4 flex flex-col items-center text-center gap-3">
            <StudentAvatar student={student} size={96} />
            <div className="space-y-1 text-sm w-full">
              {student.beltLevel && (
                <div className="font-medium text-primary">{student.beltLevel}</div>
              )}
              {student.age && (
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {student.age} yrs · {student.gender ?? "—"}
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {student.phone}
                </div>
              )}
              {student.parentName && (
                <div className="text-muted-foreground">
                  Parent: {student.parentName} {student.parentPhone && `(${student.parentPhone})`}
                </div>
              )}
              {student.address && (
                <div className="flex items-start gap-2 justify-center text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5" /> {student.address}
                </div>
              )}
              {student.joinDate && (
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Joined {student.joinDate}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Attendance" value={`${pct}%`} />
                <Stat label="Present" value={present} tone="success" />
                <Stat label="Absent" value={absent} tone="destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No achievements yet.</p>
              ) : (
                <ul className="space-y-3">
                  {achievements.map((a) => (
                    <AchievementItem key={a.id} a={a} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {student.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "success" | "destructive" }) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border p-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function AchievementItem({ a }: { a: { id?: number; title: string; description?: string; date: string; image?: Blob } }) {
  const url = useBlobURL(a.image);
  return (
    <li className="flex gap-3 items-start">
      {url ? (
        <img src={url} alt={a.title} className="h-14 w-14 rounded object-cover" />
      ) : (
        <div className="h-14 w-14 rounded bg-accent/30 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-accent-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{a.title}</div>
        <div className="text-xs text-muted-foreground">{format(new Date(a.date), "PP")}</div>
        {a.description && <div className="text-sm mt-1">{a.description}</div>}
      </div>
    </li>
  );
}
