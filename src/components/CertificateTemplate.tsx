import { format } from "date-fns";
import { useBlobURL } from "@/hooks/use-blob-url";

export type CertTemplate = "traditional" | "modern" | "gold";

export interface CertProps {
  template: CertTemplate;
  studentName: string;
  title: string;
  description?: string;
  date: string;
  masterName?: string;
  schoolName?: string;
  signature?: Blob;
}

export function Certificate(props: CertProps) {
  const { template } = props;
  const sig = useBlobURL(props.signature);
  const c: React.CSSProperties = { width: 1100, height: 780, position: "relative", overflow: "hidden" };
  const dateStr = format(new Date(props.date), "PPP");

  if (template === "traditional") {
    return (
      <div
        style={{
          ...c,
          background:
            "radial-gradient(circle at 50% 0%, #fff 60%, #f5e9d6 100%)",
          border: "12px double #8b1d1d",
          padding: 56,
          color: "#3a1010",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ border: "2px solid #8b1d1d", padding: 36, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 18, letterSpacing: 6, color: "#8b1d1d" }}>SILAMBAM</div>
          <div style={{ fontSize: 56, fontWeight: 800, marginTop: 8 }}>Certificate of Achievement</div>
          {props.schoolName && (
            <div style={{ marginTop: 8, fontStyle: "italic" }}>{props.schoolName}</div>
          )}
          <div style={{ marginTop: 40, fontSize: 20 }}>This is proudly presented to</div>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#8b1d1d", margin: "16px 0" }}>{props.studentName}</div>
          <div style={{ fontSize: 20, maxWidth: 800 }}>
            in recognition of <b>{props.title}</b>
          </div>
          {props.description && <div style={{ marginTop: 12, fontSize: 16, maxWidth: 800 }}>{props.description}</div>}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-end" }}>
            <Sig label="Date" value={dateStr} />
            <Sig label="Master" value={props.masterName ?? ""} signature={sig} />
          </div>
        </div>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div
        style={{
          ...c,
          background: "#fff",
          padding: 64,
          color: "#111",
          fontFamily: "Inter, system-ui, sans-serif",
          borderLeft: "20px solid #8b1d1d",
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 6, color: "#8b1d1d", fontWeight: 600 }}>
          CERTIFICATE
        </div>
        <div style={{ fontSize: 28, marginTop: 12, color: "#666" }}>of Achievement</div>
        <div style={{ fontSize: 64, fontWeight: 800, marginTop: 32 }}>{props.studentName}</div>
        <div style={{ marginTop: 16, fontSize: 20, maxWidth: 800 }}>
          for <b>{props.title}</b>
        </div>
        {props.description && <div style={{ marginTop: 12, fontSize: 16, color: "#444", maxWidth: 800 }}>{props.description}</div>}
        <div style={{ position: "absolute", bottom: 64, left: 64, right: 64, display: "flex", justifyContent: "space-between" }}>
          <Sig label="Date" value={dateStr} />
          <Sig label="Master" value={props.masterName ?? ""} signature={sig} />
        </div>
      </div>
    );
  }

  // gold
  return (
    <div
      style={{
        ...c,
        background: "linear-gradient(135deg, #1a1208 0%, #3a2a10 50%, #1a1208 100%)",
        padding: 56,
        color: "#f5deb3",
        fontFamily: "Georgia, serif",
        border: "8px solid #c8a14a",
      }}
    >
      <div style={{ border: "1px solid #c8a14a", padding: 36, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 18, letterSpacing: 8, color: "#e6c46a" }}>★ SILAMBAM ★</div>
        <div style={{ fontSize: 60, fontWeight: 800, marginTop: 8, color: "#f1c75a" }}>Certificate</div>
        <div style={{ fontSize: 22, opacity: 0.9 }}>of Excellence</div>
        <div style={{ marginTop: 40, fontSize: 18 }}>Awarded to</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", margin: "16px 0" }}>{props.studentName}</div>
        <div style={{ fontSize: 20, maxWidth: 800 }}>
          for outstanding <b>{props.title}</b>
        </div>
        {props.description && <div style={{ marginTop: 12, fontSize: 16, maxWidth: 800, opacity: 0.9 }}>{props.description}</div>}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-end" }}>
          <Sig label="Date" value={dateStr} dark />
          <Sig label="Master" value={props.masterName ?? ""} signature={sig} dark />
        </div>
      </div>
    </div>
  );
}

function Sig({
  label,
  value,
  signature,
  dark,
}: {
  label: string;
  value: string;
  signature?: string;
  dark?: boolean;
}) {
  const color = dark ? "#e6c46a" : "#666";
  const lineColor = dark ? "#c8a14a" : "#333";
  return (
    <div style={{ minWidth: 240, textAlign: "center" }}>
      {signature ? (
        <img src={signature} alt="" style={{ height: 40, margin: "0 auto 4px" }} />
      ) : (
        <div style={{ height: 40 }} />
      )}
      <div style={{ borderTop: `1px solid ${lineColor}`, paddingTop: 6, fontWeight: 600 }}>{value || "—"}</div>
      <div style={{ fontSize: 12, color }}>{label}</div>
    </div>
  );
}
