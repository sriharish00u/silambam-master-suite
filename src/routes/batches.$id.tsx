import { createFileRoute } from "@tanstack/react-router";
import { BatchDetailPage } from "@/components/pages/BatchDetailPage";

export const Route = createFileRoute("/batches/$id")({
  head: () => ({
    meta: [
      { title: "Batch — Silambam" },
      { name: "description", content: "Batch details and student roster." },
    ],
  }),
  component: BatchDetail,
});

function BatchDetail() {
  const { id } = Route.useParams();
  return <BatchDetailPage batchId={Number(id)} />;
}
