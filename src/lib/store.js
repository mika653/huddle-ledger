import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

// Uses Upstash Redis when the project is connected to one on Vercel
// (env vars are injected automatically by the marketplace integration).
// Falls back to a local JSON file so `npm run dev` works with zero setup
// before any database is wired up.

const hasRedis = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const redis = hasRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const LOCAL_DIR = path.join(process.cwd(), ".local-data");
const LOCAL_FILE = path.join(LOCAL_DIR, "store.json");

async function readLocalFile() {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLocalFile(data) {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const usingRedis = hasRedis;

export async function kvGet(key) {
  if (redis) return redis.get(key);
  const data = await readLocalFile();
  return data[key] ?? null;
}

export async function kvSet(key, value) {
  if (redis) {
    await redis.set(key, value);
    return;
  }
  const data = await readLocalFile();
  data[key] = value;
  await writeLocalFile(data);
}

export async function kvSAdd(key, member) {
  if (redis) {
    await redis.sadd(key, member);
    return;
  }
  const data = await readLocalFile();
  const set = new Set(data[key] || []);
  set.add(member);
  data[key] = Array.from(set);
  await writeLocalFile(data);
}

export async function kvSMembers(key) {
  if (redis) return redis.smembers(key);
  const data = await readLocalFile();
  return data[key] || [];
}
