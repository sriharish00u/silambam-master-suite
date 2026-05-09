import { createFileRoute } from "@tanstack/react-router";
import { BackupPage } from "@/components/pages/BackupPage";

export const Route = createFileRoute("/backup")({
  head: () => ({
    meta: [
      { title: "Backup & Restore — Silambam" },
      { name: "description", content: "Export and restore your full Silambam class data offline." },
    ],
  }),
  component: () => <BackupPage />,
});
