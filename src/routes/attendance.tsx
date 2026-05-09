import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/components/pages/AttendancePage";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Take attendance — Silambam" },
      { name: "description", content: "Mark daily attendance for your Silambam batches in seconds." },
    ],
  }),
  component: () => <AttendancePage />,
});
