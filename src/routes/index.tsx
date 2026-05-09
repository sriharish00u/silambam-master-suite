import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Silambam Class Manager — Dashboard" },
      { name: "description", content: "Offline attendance, students, achievements & certificates for Silambam masters." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Dashboard />;
}
