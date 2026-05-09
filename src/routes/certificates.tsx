import { createFileRoute } from "@tanstack/react-router";
import { CertificatesPage } from "@/components/pages/CertificatesPage";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates — Silambam" },
      { name: "description", content: "Generate and export beautiful Silambam achievement certificates." },
    ],
  }),
  component: () => <CertificatesPage />,
});
