import { createFileRoute } from "@tanstack/react-router";
import { AchievementsPage } from "@/components/pages/AchievementsPage";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Silambam" },
      { name: "description", content: "Track student achievements, awards and belt promotions." },
    ],
  }),
  component: () => <AchievementsPage />,
});
