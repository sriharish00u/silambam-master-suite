import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { BatchesPage } from "@/components/pages/BatchesPage";

function BatchesLayout() {
  const { location } = useRouterState();

  if (location.pathname === "/batches") {
    return <BatchesPage />;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/batches")({
  head: () => ({
    meta: [
      { title: "Batches — Silambam Class Manager" },
      { name: "description", content: "Manage Silambam training batches: timings, days, and students." },
    ],
  }),
  component: BatchesLayout,
});
