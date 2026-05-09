import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, getDaysInMonth } from "date-fns";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { batchRepo, studentRepo, attendanceRepo } from "@/lib/repos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function ReportsPage() {
  const batches = useLiveQuery(() => batchRepo.list(), []) ?? [];
  const [batchId, setBatchId] = useState<string>("");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const batch = batches.find((b) => b.id === Number(batchId));
  const students = useLiveQuery(
    async () => (batchId ? await studentRepo.byBatch(Number(batchId)) : []),
    [batchId],
  ) ?? [];
  const records = useLiveQuery(
    async () => (batchId ? await attendanceRepo.byBatchMonth(Number(batchId), month) : []),
    [batchId, month],
  ) ?? [];

  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return getDaysInMonth(new Date(y, m - 1));
  }, [month]);

  // Build matrix: studentId -> day -> status
  const matrix = useMemo(() => {
    const m: Record<number, Record<number, "present" | "absent" | undefined>> = {};
    for (const s of students) if (s.id) m[s.id] = {};
    for (const r of records) {
      const day = Number(r.date.slice(8, 10));
      for (const [sid, status] of Object.entries(r.records)) {
        const id = Number(sid);
        if (!m[id]) m[id] = {};
        m[id][day] = status;
      }
    }
    return m;
  }, [students, records]);

  const exportPdf = () => {
    if (!batch) return;
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    pdf.setFontSize(14);
    pdf.text(`${batch.name} — ${format(new Date(month + "-01"), "MMMM yyyy")}`, 40, 30);
    const head = [["Student", ...Array.from({ length: days }, (_, i) => String(i + 1)), "P", "A", "%"]];
    const body = students.map((s) => {
      let p = 0,
        a = 0;
      const cells: string[] = [];
      for (let d = 1; d <= days; d++) {
        const v = matrix[s.id!]?.[d];
        if (v === "present") {
          p++;
          cells.push("P");
        } else if (v === "absent") {
          a++;
          cells.push("A");
        } else cells.push("");
      }
      const total = p + a;
      return [s.name, ...cells, String(p), String(a), total ? `${Math.round((p / total) * 100)}%` : "-"];
    });
    autoTable(pdf, {
      head,
      body,
      startY: 50,
      styles: { fontSize: 8, cellPadding: 2, halign: "center" },
      headStyles: { fillColor: [139, 29, 29] },
      columnStyles: { 0: { halign: "left", cellWidth: 90 } },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 0 && data.column.index <= days) {
          if (data.cell.raw === "P") data.cell.styles.fillColor = [200, 240, 200];
          if (data.cell.raw === "A") data.cell.styles.fillColor = [255, 200, 200];
        }
      },
    });
    pdf.save(`${batch.name}-${month}.pdf`);
    toast.success("PDF exported");
  };

  const exportXlsx = () => {
    if (!batch) return;
    const header = ["Student", ...Array.from({ length: days }, (_, i) => i + 1), "Present", "Absent", "%"];
    const rows = students.map((s) => {
      let p = 0,
        a = 0;
      const cells: (string | number)[] = [];
      for (let d = 1; d <= days; d++) {
        const v = matrix[s.id!]?.[d];
        if (v === "present") {
          p++;
          cells.push("P");
        } else if (v === "absent") {
          a++;
          cells.push("A");
        } else cells.push("");
      }
      const total = p + a;
      return [s.name, ...cells, p, a, total ? Math.round((p / total) * 100) : 0];
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `${batch.name}-${month}.xlsx`);
    toast.success("Excel exported");
  };

  return (
    <div>
      <PageHeader title="Reports" description="Monthly attendance per batch" />

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label>Batch</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Month</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <Button onClick={exportPdf} disabled={!batch}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button onClick={exportXlsx} variant="secondary" disabled={!batch}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
        </CardContent>
      </Card>

      {!batch ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a batch to view its monthly report.
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No students in this batch.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto rounded-lg border border-border bg-card">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="sticky left-0 bg-muted text-left px-2 py-2 border-b border-border">Student</th>
                {Array.from({ length: days }, (_, i) => (
                  <th key={i} className="px-1.5 py-2 border-b border-border text-center font-medium">
                    {i + 1}
                  </th>
                ))}
                <th className="px-2 py-2 border-b border-border">P</th>
                <th className="px-2 py-2 border-b border-border">A</th>
                <th className="px-2 py-2 border-b border-border">%</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                let p = 0,
                  a = 0;
                const cells = [];
                for (let d = 1; d <= days; d++) {
                  const v = matrix[s.id!]?.[d];
                  if (v === "present") p++;
                  else if (v === "absent") a++;
                  cells.push(
                    <td
                      key={d}
                      className={
                        "px-1.5 py-1 text-center border-b border-border " +
                        (v === "present"
                          ? "bg-success/30"
                          : v === "absent"
                          ? "bg-destructive/30"
                          : "")
                      }
                    >
                      {v === "present" ? "P" : v === "absent" ? "A" : ""}
                    </td>,
                  );
                }
                const total = p + a;
                return (
                  <tr key={s.id}>
                    <td className="sticky left-0 bg-card px-2 py-1 border-b border-border font-medium whitespace-nowrap">
                      {s.name}
                    </td>
                    {cells}
                    <td className="px-2 py-1 border-b border-border text-center font-semibold text-success">{p}</td>
                    <td className="px-2 py-1 border-b border-border text-center font-semibold text-destructive">{a}</td>
                    <td className="px-2 py-1 border-b border-border text-center font-semibold">
                      {total ? `${Math.round((p / total) * 100)}%` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
