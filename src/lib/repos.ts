import { getDB, type Achievement, type AttendanceRecord, type Batch, type Student } from "./db";

// Batches
export const batchRepo = {
  list: () => getDB().batches.orderBy("createdAt").reverse().toArray(),
  get: (id: number) => getDB().batches.get(id),
  add: (b: Omit<Batch, "id" | "createdAt">) =>
    getDB().batches.add({ ...b, createdAt: Date.now() }),
  update: (id: number, b: Partial<Batch>) => getDB().batches.update(id, b),
  remove: async (id: number) => {
    const db = getDB();
    await db.transaction("rw", db.batches, db.students, db.deleted, async () => {
      const batch = await db.batches.get(id);
      const students = await db.students.where("batchId").equals(id).toArray();
      if (batch) {
        await db.deleted.add({
          type: "batch",
          data: { batch, students },
          deletedAt: Date.now(),
        });
      }
      await db.students.where("batchId").equals(id).delete();
      await db.batches.delete(id);
    });
  },
  count: () => getDB().batches.count(),
};

// Students
export const studentRepo = {
  list: () => getDB().students.orderBy("createdAt").reverse().toArray(),
  byBatch: (batchId: number) =>
    getDB().students.where("batchId").equals(batchId).sortBy("name"),
  get: (id: number) => getDB().students.get(id),
  add: (s: Omit<Student, "id" | "createdAt">) =>
    getDB().students.add({ ...s, createdAt: Date.now() }),
  update: (id: number, s: Partial<Student>) => getDB().students.update(id, s),
  remove: async (id: number) => {
    const db = getDB();
    await db.transaction("rw", db.students, db.deleted, async () => {
      const student = await db.students.get(id);
      if (student) {
        await db.deleted.add({
          type: "student",
          data: student,
          deletedAt: Date.now(),
        });
      }
      await db.students.delete(id);
    });
  },
  count: () => getDB().students.count(),
  recent: (limit = 5) =>
    getDB().students.orderBy("createdAt").reverse().limit(limit).toArray(),
};

// Attendance
export const attendanceRepo = {
  get: async (batchId: number, date: string): Promise<AttendanceRecord | undefined> => {
    return getDB()
      .attendance.where("[batchId+date]")
      .equals([batchId, date])
      .first();
  },
  upsert: async (batchId: number, date: string, records: AttendanceRecord["records"]) => {
    const db = getDB();
    const existing = await db.attendance.where("[batchId+date]").equals([batchId, date]).first();
    if (existing?.id) {
      await db.attendance.update(existing.id, { records });
      return existing.id;
    }
    return db.attendance.add({ batchId, date, records });
  },
  byStudent: async (studentId: number) => {
    const all = await getDB().attendance.toArray();
    return all.filter((a) => a.records[studentId] !== undefined);
  },
  byBatchMonth: async (batchId: number, yearMonth: string /* YYYY-MM */) => {
    const all = await getDB().attendance.where("batchId").equals(batchId).toArray();
    return all.filter((a) => a.date.startsWith(yearMonth));
  },
  todayCount: async (today: string) => {
    const recs = await getDB().attendance.where("date").equals(today).toArray();
    let present = 0;
    let absent = 0;
    for (const r of recs) {
      for (const s of Object.values(r.records)) {
        if (s === "present") present++;
        else absent++;
      }
    }
    return { present, absent, batches: recs.length };
  },
};

// Achievements
export const achievementRepo = {
  list: () => getDB().achievements.orderBy("date").reverse().toArray(),
  byStudent: (studentId: number) =>
    getDB().achievements.where("studentId").equals(studentId).reverse().sortBy("date"),
  get: (id: number) => getDB().achievements.get(id),
  add: (a: Omit<Achievement, "id" | "createdAt">) =>
    getDB().achievements.add({ ...a, createdAt: Date.now() }),
  update: (id: number, a: Partial<Achievement>) => getDB().achievements.update(id, a),
  remove: (id: number) => getDB().achievements.delete(id),
  recent: (limit = 5) =>
    getDB().achievements.orderBy("createdAt").reverse().limit(limit).toArray(),
};

// History
export const historyRepo = {
  list: () => getDB().deleted.orderBy("deletedAt").reverse().toArray(),
  remove: (id: number) => getDB().deleted.delete(id),
  restoreBatch: async (id: number) => {
    const db = getDB();
    const item = await db.deleted.get(id);
    if (!item || item.type !== "batch") return;
    const data = item.data as { batch: Batch; students: Student[] };
    await db.transaction("rw", db.batches, db.students, db.deleted, async () => {
      const newBatchId = await db.batches.add({ ...data.batch, id: undefined });
      for (const s of data.students) {
        await db.students.add({ ...s, id: undefined, batchId: newBatchId });
      }
      await db.deleted.delete(id);
    });
  },
  restoreStudent: async (id: number) => {
    const db = getDB();
    const item = await db.deleted.get(id);
    if (!item || item.type !== "student") return;
    const data = item.data as Student;
    await db.transaction("rw", db.students, db.deleted, async () => {
      await db.students.add({ ...data, id: undefined });
      await db.deleted.delete(id);
    });
  },
};

// Settings
export const settingsRepo = {
  get: async () => {
    const all = await getDB().settings.toArray();
    return all[0];
  },
  save: async (s: { masterName?: string; schoolName?: string; signature?: Blob }) => {
    const db = getDB();
    const existing = (await db.settings.toArray())[0];
    if (existing?.id) {
      await db.settings.update(existing.id, s);
    } else {
      await db.settings.add(s);
    }
  },
};
