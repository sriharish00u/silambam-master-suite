import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/pages/HistoryPage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Silambam" },
      { name: "description", content: "Restore deleted students and batches." },
    ],
  }),
  component: () => <HistoryPage />,
});
