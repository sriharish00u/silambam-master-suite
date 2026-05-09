import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/pages/ReportsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Silambam" },
      { name: "description", content: "Monthly attendance reports for batches and students. Export PDF or Excel." },
    ],
  }),
  component: () => <ReportsPage />,
});
