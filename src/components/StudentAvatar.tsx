import { useBlobURL } from "@/hooks/use-blob-url";
import type { Student } from "@/lib/db";

export function StudentAvatar({ student, size = 40 }: { student: Student; size?: number }) {
  const url = useBlobURL(student.photo);
  const initials = student.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center text-primary-foreground font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--gradient-primary)",
        fontSize: size * 0.36,
      }}
    >
      {url ? (
        <img src={url} alt={student.name} className="w-full h-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
