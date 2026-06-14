import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  type AppData,
  type DiveSession,
  type Subject,
  type Meta,
  type SubjectColorToken,
  SCHEMA_VERSION,
  DEPTH_ZONES,
} from "./types";
import { CREATURES } from "./creatures";
import { makeSeedData } from "./seed";
import { startOfDay, DAY_MS } from "./format";

/**
 * SQLite 영속 레이어 (진실의 원천). node:sqlite(내장) 사용.
 * 단일 사용자(글로벌) — 인증 없는 개인 트래커 데모.
 * 해금/신기록/스트릭 등 파생값은 모두 여기(서버)에서 계산한다.
 */

const DB_VERSION = 1;

function defaultMeta(): Meta {
  return {
    schemaVersion: SCHEMA_VERSION,
    theme: "dark",
    reducedMotion: null,
    bestDepthM: 0,
    longestStreak: 0,
    seededOnce: false,
  };
}

// dev HMR에서 커넥션 중복 방지
const g = globalThis as unknown as { __deepdiveDb?: DatabaseSync };

function openDb(): DatabaseSync {
  const dir = path.join(process.cwd(), ".data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "deepdive.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  return db;
}

function getDb(): DatabaseSync {
  if (!g.__deepdiveDb) g.__deepdiveDb = openDb();
  return g.__deepdiveDb;
}

function migrate(db: DatabaseSync) {
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  let v = row?.user_version ?? 0;

  if (v < 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        color_token TEXT NOT NULL,
        created_at  INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id           TEXT PRIMARY KEY,
        subject_id   TEXT NOT NULL,
        started_at   INTEGER NOT NULL,
        ended_at     INTEGER NOT NULL,
        duration_sec INTEGER NOT NULL,
        depth_m      INTEGER NOT NULL,
        status       TEXT NOT NULL,
        note         TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
      CREATE TABLE IF NOT EXISTS unlocks (
        creature_id TEXT PRIMARY KEY,
        unlocked_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS meta (
        id             INTEGER PRIMARY KEY CHECK (id = 1),
        schema_version INTEGER NOT NULL,
        theme          TEXT NOT NULL,
        reduced_motion INTEGER,
        best_depth_m   INTEGER NOT NULL,
        longest_streak INTEGER NOT NULL,
        seeded_once    INTEGER NOT NULL
      );
    `);
    v = 1;
  }
  // 다음 버전: if (v < 2) { ...; v = 2; }
  db.exec(`PRAGMA user_version = ${DB_VERSION}`);

  ensureSeeded(db);
}

/** meta 행이 없으면 생성하고, 첫 부팅이면 더미 데이터 1회 주입 */
function ensureSeeded(db: DatabaseSync) {
  const meta = db.prepare("SELECT * FROM meta WHERE id = 1").get() as
    | Record<string, unknown>
    | undefined;
  if (!meta) {
    const seeded = makeSeedData();
    writeAll(db, seeded);
    recompute(db);
    db.prepare("UPDATE meta SET seeded_once = 1 WHERE id = 1").run();
  }
}

// ---- 읽기 ----------------------------------------------------------------

function rowToSubject(r: Record<string, unknown>): Subject {
  return {
    id: r.id as string,
    name: r.name as string,
    colorToken: r.color_token as SubjectColorToken,
    createdAt: r.created_at as number,
  };
}
function rowToSession(r: Record<string, unknown>): DiveSession {
  return {
    id: r.id as string,
    subjectId: r.subject_id as string,
    startedAt: r.started_at as number,
    endedAt: r.ended_at as number,
    durationSec: r.duration_sec as number,
    depthM: r.depth_m as number,
    status: r.status as DiveSession["status"],
    note: (r.note as string | null) ?? undefined,
  };
}

export function getData(): AppData {
  const db = getDb();
  const subjects = (
    db.prepare("SELECT * FROM subjects ORDER BY created_at ASC").all() as Record<string, unknown>[]
  ).map(rowToSubject);
  const sessions = (
    db.prepare("SELECT * FROM sessions ORDER BY started_at ASC").all() as Record<string, unknown>[]
  ).map(rowToSession);
  const unlockRows = db.prepare("SELECT * FROM unlocks").all() as Record<string, unknown>[];
  const unlocks: Record<string, number> = {};
  for (const u of unlockRows) unlocks[u.creature_id as string] = u.unlocked_at as number;

  const m = db.prepare("SELECT * FROM meta WHERE id = 1").get() as Record<string, unknown>;
  const meta: Meta = m
    ? {
        schemaVersion: m.schema_version as number,
        theme: m.theme as Meta["theme"],
        reducedMotion: m.reduced_motion === null ? null : m.reduced_motion === 1,
        bestDepthM: m.best_depth_m as number,
        longestStreak: m.longest_streak as number,
        seededOnce: m.seeded_once === 1,
      }
    : defaultMeta();

  return { subjects, sessions, unlocks, meta };
}

// ---- 쓰기 헬퍼 -----------------------------------------------------------

function writeAll(db: DatabaseSync, data: AppData) {
  db.exec("DELETE FROM subjects; DELETE FROM sessions; DELETE FROM unlocks; DELETE FROM meta;");
  const insS = db.prepare(
    "INSERT INTO subjects (id, name, color_token, created_at) VALUES (?, ?, ?, ?)",
  );
  for (const s of data.subjects) insS.run(s.id, s.name, s.colorToken, s.createdAt);

  const insSess = db.prepare(
    "INSERT INTO sessions (id, subject_id, started_at, ended_at, duration_sec, depth_m, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const s of data.sessions)
    insSess.run(s.id, s.subjectId, s.startedAt, s.endedAt, s.durationSec, s.depthM, s.status, s.note ?? null);

  const insU = db.prepare("INSERT INTO unlocks (creature_id, unlocked_at) VALUES (?, ?)");
  for (const [cid, at] of Object.entries(data.unlocks)) insU.run(cid, at);

  const m = data.meta;
  db.prepare(
    "INSERT INTO meta (id, schema_version, theme, reduced_motion, best_depth_m, longest_streak, seeded_once) VALUES (1, ?, ?, ?, ?, ?, ?)",
  ).run(
    SCHEMA_VERSION,
    m.theme,
    m.reducedMotion === null ? null : m.reducedMotion ? 1 : 0,
    m.bestDepthM,
    m.longestStreak,
    m.seededOnce ? 1 : 0,
  );
}

// ---- 파생값 재계산 (서버 권위) -------------------------------------------

function computeLongestStreak(days: number[]): number {
  if (days.length === 0) return 0;
  const uniq = [...new Set(days)].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < uniq.length; i++) {
    const diff = Math.round((uniq[i] - uniq[i - 1]) / DAY_MS);
    if (diff === 1) run += 1;
    else run = 1;
    best = Math.max(best, run);
  }
  return best;
}

/** sessions 기준으로 unlocks/best_depth/longest_streak 재계산 후 반영 */
function recompute(db: DatabaseSync) {
  const sessions = (
    db.prepare("SELECT * FROM sessions WHERE status = 'completed'").all() as Record<string, unknown>[]
  ).map(rowToSession);

  const bestDepthM = sessions.reduce((m, s) => Math.max(m, s.depthM), 0);
  const longestStreak = computeLongestStreak(sessions.map((s) => startOfDay(s.startedAt)));

  // 해금: 도달 수심대의 생물을, 아직 없으면 추가
  const existing = new Set(
    (db.prepare("SELECT creature_id FROM unlocks").all() as Record<string, unknown>[]).map(
      (r) => r.creature_id as string,
    ),
  );
  const insU = db.prepare(
    "INSERT OR IGNORE INTO unlocks (creature_id, unlocked_at) VALUES (?, ?)",
  );
  for (const s of sessions) {
    for (const zone of DEPTH_ZONES) {
      if (s.depthM >= zone.minDepth) {
        for (const c of CREATURES) {
          if (c.zone === zone.id && !existing.has(c.id)) {
            insU.run(c.id, s.endedAt);
            existing.add(c.id);
          }
        }
      }
    }
  }

  db.prepare("UPDATE meta SET best_depth_m = ?, longest_streak = ? WHERE id = 1").run(
    bestDepthM,
    longestStreak,
  );
}

// ---- 뮤테이션 (API에서 호출) --------------------------------------------

export interface CommitResult {
  data: AppData;
  newlyUnlocked: string[];
  isRecord: boolean;
  prevBest: number;
}

export function commitSession(session: DiveSession): CommitResult {
  const db = getDb();
  const prevBest =
    (db.prepare("SELECT best_depth_m AS b FROM meta WHERE id = 1").get() as { b: number })?.b ?? 0;
  const before = new Set(
    (db.prepare("SELECT creature_id FROM unlocks").all() as Record<string, unknown>[]).map(
      (r) => r.creature_id as string,
    ),
  );

  db.prepare(
    "INSERT OR REPLACE INTO sessions (id, subject_id, started_at, ended_at, duration_sec, depth_m, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    session.id,
    session.subjectId,
    session.startedAt,
    session.endedAt,
    session.durationSec,
    session.depthM,
    session.status,
    session.note ?? null,
  );
  recompute(db);

  const after = db.prepare("SELECT creature_id FROM unlocks").all() as Record<string, unknown>[];
  const newlyUnlocked = after
    .map((r) => r.creature_id as string)
    .filter((id) => !before.has(id));
  const isRecord = session.status === "completed" && session.depthM > prevBest;

  return { data: getData(), newlyUnlocked, isRecord, prevBest };
}

export function addSubject(name: string, colorToken: SubjectColorToken): { data: AppData; subject: Subject } {
  const db = getDb();
  const subject: Subject = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 40),
    colorToken,
    createdAt: Date.now(),
  };
  db.prepare("INSERT INTO subjects (id, name, color_token, created_at) VALUES (?, ?, ?, ?)").run(
    subject.id,
    subject.name,
    subject.colorToken,
    subject.createdAt,
  );
  return { data: getData(), subject };
}

export function removeSubject(id: string): AppData {
  const db = getDb();
  db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
  return getData();
}

export function setMeta(patch: Partial<Pick<Meta, "reducedMotion" | "theme">>): AppData {
  const db = getDb();
  if (patch.reducedMotion !== undefined) {
    db.prepare("UPDATE meta SET reduced_motion = ? WHERE id = 1").run(
      patch.reducedMotion === null ? null : patch.reducedMotion ? 1 : 0,
    );
  }
  if (patch.theme !== undefined) {
    db.prepare("UPDATE meta SET theme = ? WHERE id = 1").run(patch.theme);
  }
  return getData();
}

export function seedData(): AppData {
  const db = getDb();
  const seeded = makeSeedData();
  writeAll(db, seeded);
  recompute(db);
  db.prepare("UPDATE meta SET seeded_once = 1 WHERE id = 1").run();
  return getData();
}

export function resetData(): AppData {
  const db = getDb();
  writeAll(db, { subjects: [], sessions: [], unlocks: {}, meta: { ...defaultMeta(), seededOnce: true } });
  return getData();
}

export function replaceAllData(data: AppData): AppData {
  const db = getDb();
  writeAll(db, { ...data, meta: { ...data.meta, seededOnce: true } });
  recompute(db);
  return getData();
}
