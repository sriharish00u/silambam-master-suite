import Dexie, { type Table } from "dexie";

export interface Batch {
  id?: number;
  name: string;
  startTime?: string;
  endTime?: string;
  days: string[]; // ['Mon','Tue',...]
  notes?: string;
  createdAt: number;
}

export interface Student {
  id?: number;
  batchId: number;
  name: string;
  age?: number;
  gender?: "male" | "female" | "other";
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  joinDate?: string;
  beltLevel?: string;
  notes?: string;
  photo?: Blob;
  createdAt: number;
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id?: number;
  batchId: number;
  date: string; // YYYY-MM-DD
  records: Record<number, AttendanceStatus>; // studentId -> status
}

export interface Achievement {
  id?: number;
  studentId: number;
  title: string;
  description?: string;
  date: string;
  image?: Blob;
  createdAt: number;
}

export interface DeletedItem {
  id?: number;
  type: "batch" | "student";
  data: unknown;
  deletedAt: number;
}

export interface Settings {
  id?: number;
  masterName?: string;
  schoolName?: string;
  signature?: Blob;
}

export class SilambamDB extends Dexie {
  batches!: Table<Batch, number>;
  students!: Table<Student, number>;
  attendance!: Table<AttendanceRecord, number>;
  achievements!: Table<Achievement, number>;
  deleted!: Table<DeletedItem, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super("SilambamDB");
    this.version(1).stores({
      batches: "++id, name, createdAt",
      students: "++id, batchId, name, createdAt",
      attendance: "++id, batchId, date, [batchId+date]",
      achievements: "++id, studentId, date, createdAt",
      deleted: "++id, type, deletedAt",
      settings: "++id",
    });
  }
}

// Lazy singleton — only instantiate in browser
let _db: SilambamDB | null = null;
export function getDB(): SilambamDB {
  if (typeof window === "undefined") {
    throw new Error("DB only available in browser");
  }
  if (!_db) _db = new SilambamDB();
  return _db;
}
