import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/pages/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Silambam" },
      { name: "description", content: "Master profile and preferences." },
    ],
  }),
  component: () => <SettingsPage />,
});
