import { z } from "zod";
import { SCHEMA_VERSION, SUBJECT_COLOR_TOKENS } from "./types";

/**
 * 영속화 레이어의 신뢰 경계.
 * localStorage는 사용자가/다른 탭이/이전 버전이 오염시킬 수 있는 외부 입력이므로
 * 읽을 때 반드시 zod로 검증한다. 깨진 데이터는 조용히 버리지 않고 분기 처리한다.
 */

export const subjectColorTokenSchema = z.enum(SUBJECT_COLOR_TOKENS);

export const subjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(40),
  colorToken: subjectColorTokenSchema,
  createdAt: z.number().int().nonnegative(),
});

export const diveSessionSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  startedAt: z.number().int().nonnegative(),
  endedAt: z.number().int().nonnegative(),
  durationSec: z.number().int().nonnegative(),
  depthM: z.number().int().nonnegative(),
  status: z.enum(["completed", "aborted"]),
  note: z.string().max(280).optional(),
});

export const metaSchema = z.object({
  schemaVersion: z.number().int(),
  theme: z.enum(["light", "dark", "system"]),
  reducedMotion: z.boolean().nullable(),
  bestDepthM: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  seededOnce: z.boolean(),
});

export const activeDiveSchema = z.object({
  subjectId: z.string().min(1),
  startedAt: z.number().int().nonnegative(),
  pausedAccumSec: z.number().nonnegative(),
  pausedAt: z.number().int().nonnegative().nullable(),
  goalDepthM: z.number().int().positive(),
});

export const appDataSchema = z.object({
  subjects: z.array(subjectSchema),
  sessions: z.array(diveSessionSchema),
  unlocks: z.record(z.string(), z.number().int().nonnegative()),
  meta: metaSchema,
});

export type AppDataInput = z.infer<typeof appDataSchema>;

/** 내보내기/가져오기 파일 포맷 */
export const exportFileSchema = z.object({
  app: z.literal("deepdive"),
  schemaVersion: z.number().int(),
  exportedAt: z.number().int(),
  data: appDataSchema,
});

export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION;
