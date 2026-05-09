import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarCheck,
  Plus,
  Users,
  Trophy,
  FileBarChart,
  Database,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { batchRepo, studentRepo, achievementRepo, attendanceRepo } from "@/lib/repos";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  hint?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="text-3xl font-bold mt-1">{value}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const batchCount = useLiveQuery(() => batchRepo.count(), []) ?? 0;
  const studentCount = useLiveQuery(() => studentRepo.count(), []) ?? 0;
  const todayStats =
    useLiveQuery(() => attendanceRepo.todayCount(today), [today]) ?? {
      present: 0,
      absent: 0,
      batches: 0,
    };
  const recentStudents = useLiveQuery(() => studentRepo.recent(5), []) ?? [];
  const recentAchievements = useLiveQuery(() => achievementRepo.recent(5), []) ?? [];

  return (
    <div>
      <PageHeader
        title={`Vanakkam, Master 🙏`}
        description={`Today is ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Batches" value={batchCount} icon={Users} />
        <StatCard label="Students" value={studentCount} icon={Swords} />
        <StatCard
          label="Present today"
          value={todayStats.present}
          icon={CalendarCheck}
          hint={`${todayStats.absent} absent · ${todayStats.batches} batches`}
        />
        <StatCard label="Achievements" value={recentAchievements.length} icon={Trophy} />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
        <Button asChild size="lg" className="h-auto py-4 flex-col gap-2">
          <Link to="/attendance">
            <CalendarCheck className="h-5 w-5" />
            <span className="text-sm">Take Attendance</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-auto py-4 flex-col gap-2">
          <Link to="/batches">
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add Student / Batch</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-auto py-4 flex-col gap-2">
          <Link to="/achievements">
            <Trophy className="h-5 w-5" />
            <span className="text-sm">Achievements</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-auto py-4 flex-col gap-2">
          <Link to="/reports">
            <FileBarChart className="h-5 w-5" />
            <span className="text-sm">Reports</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-auto py-4 flex-col gap-2">
          <Link to="/backup">
            <Database className="h-5 w-5" />
            <span className="text-sm">Backup</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent students</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentStudents.map((s) => (
                  <li key={s.id} className="py-2 flex items-center justify-between">
                    <Link
                      to="/students/$id"
                      params={{ id: String(s.id) }}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {format(s.createdAt, "MMM d")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No achievements yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAchievements.map((a) => (
                  <li key={a.id} className="py-2 flex items-center justify-between">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
