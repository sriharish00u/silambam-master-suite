import { createFileRoute } from "@tanstack/react-router";
import { StudentProfilePage } from "@/components/pages/StudentProfilePage";

export const Route = createFileRoute("/students/$id")({
  head: () => ({
    meta: [
      { title: "Student profile — Silambam" },
      { name: "description", content: "Student profile, attendance and achievements." },
    ],
  }),
  component: StudentRoute,
});

function StudentRoute() {
  const { id } = Route.useParams();
  return <StudentProfilePage studentId={Number(id)} />;
}
