/**
 * Seed script: creates default teacher + class codes if they don't exist.
 * Run once on startup.
 */
import { db } from "@workspace/db";
import { teachers, classCodes } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

const DEFAULT_TEACHER_CODE = "Karyul04";
const DEFAULT_CLASSES = [
  { code: "CLASE8A", label: "8° A" },
  { code: "CLASE8B", label: "8° B" },
  { code: "CLASE8C", label: "8° C" },
];

export async function seed() {
  // Ensure default teacher exists
  let teacherRow = await db
    .select()
    .from(teachers)
    .where(eq(teachers.teacherCode, DEFAULT_TEACHER_CODE))
    .limit(1);

  if (teacherRow.length === 0) {
    const [newTeacher] = await db
      .insert(teachers)
      .values({ teacherCode: DEFAULT_TEACHER_CODE, name: "Docente" })
      .returning();
    teacherRow = [newTeacher];
    logger.info("Seeded default teacher");
  }

  const teacherId = teacherRow[0].id;

  // Ensure default class codes exist
  for (const cls of DEFAULT_CLASSES) {
    const existing = await db
      .select()
      .from(classCodes)
      .where(eq(classCodes.code, cls.code))
      .limit(1);

    if (existing.length === 0) {
      await db
        .insert(classCodes)
        .values({ code: cls.code, label: cls.label, teacherId });
      logger.info({ code: cls.code }, "Seeded class code");
    }
  }
}
