import { useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Certificate, type CertTemplate } from "@/components/CertificateTemplate";
import { achievementRepo, studentRepo, settingsRepo } from "@/lib/repos";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function CertificatesPage() {
  const achievements = useLiveQuery(() => achievementRepo.list(), []) ?? [];
  const students = useLiveQuery(() => studentRepo.list(), []) ?? [];
  const settings = useLiveQuery(() => settingsRepo.get(), []);
  const [achId, setAchId] = useState<string>("");
  const [template, setTemplate] = useState<CertTemplate>("traditional");
  const previewRef = useRef<HTMLDivElement>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const ach = useMemo(() => achievements.find((a) => a.id === Number(achId)), [achId, achievements]);
  const student = useMemo(() => students.find((s) => s.id === ach?.studentId), [students, ach]);

  const exportPdf = async () => {
    if (!certRef.current || !ach || !student) return;
    toast.loading("Generating PDF…", { id: "cert" });

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const origHtmlBg = htmlEl.style.backgroundColor;
    const origBodyBg = bodyEl.style.backgroundColor;
    htmlEl.style.backgroundColor = "#ffffff";
    bodyEl.style.backgroundColor = "#ffffff";

    let tempContainer: HTMLDivElement | null = null;
    try {
      const clone = certRef.current.cloneNode(true) as HTMLElement;
      tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "1100px";
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const canvas = await Promise.race([
        html2canvas(clone, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false }),
        new Promise<HTMLCanvasElement>((_, reject) =>
          setTimeout(() => reject(new Error("html2canvas timed out")), 30000),
        ),
      ]);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1100, 780] });
      pdf.addImage(imgData, "PNG", 0, 0, 1100, 780);
      pdf.save(`certificate-${student.name.replace(/\s+/g, "-")}.pdf`);
      toast.success("Certificate exported", { id: "cert" });
    } catch (err) {
      console.error("Certificate export failed:", err);
      toast.error("Failed to generate PDF: " + (err instanceof Error ? err.message : String(err)), { id: "cert" });
    } finally {
      htmlEl.style.backgroundColor = origHtmlBg;
      bodyEl.style.backgroundColor = origBodyBg;
      if (tempContainer) document.body.removeChild(tempContainer);
    }
  };

  return (
    <div>
      <PageHeader title="Certificates" description="Generate beautiful PDFs from achievements" />

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-3 md:grid-cols-3">
          <div>
            <Label>Achievement</Label>
            <Select value={achId} onValueChange={setAchId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick an achievement" />
              </SelectTrigger>
              <SelectContent>
                {achievements.map((a) => {
                  const s = students.find((x) => x.id === a.studentId);
                  return (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {s?.name ?? "?"} — {a.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Template</Label>
            <Select value={template} onValueChange={(v) => setTemplate(v as CertTemplate)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="gold">Gold Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={exportPdf} disabled={!ach || !student} className="w-full">
              <Download className="h-4 w-4 mr-1" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {ach && student ? (
        <div className="overflow-auto rounded-lg border border-border bg-muted/30 p-4">
          <div ref={previewRef} className="origin-top-left scale-[0.6] md:scale-[0.7] inline-block">
            <div ref={certRef} className="certificate-export" style={{ backgroundColor: '#ffffff' }}>
              <Certificate
                template={template}
                studentName={student.name}
                title={ach.title}
                description={ach.description}
                date={ach.date}
                masterName={settings?.masterName}
                schoolName={settings?.schoolName}
                signature={settings?.signature}
              />
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Pick an achievement to preview the certificate.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
