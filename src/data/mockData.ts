export type Department = "Engineering" | "Design" | "Sales" | "Support" | "Marketing";
export type Status = "active" | "paused" | "archived";

export interface Row {
  id: string;
  name: string;
  department: Department;
  status: Status;
  revenue: number;
  lastActiveDaysAgo: number;
}

const DEPARTMENTS: Department[] = ["Engineering", "Design", "Sales", "Support", "Marketing"];
const STATUSES: Status[] = ["active", "paused", "archived"];

const FIRST_NAMES = [
  "Alex", "Bianca", "Carlo", "Diana", "Elio", "Fatima", "Giulia", "Hassan",
  "Ines", "Jacopo", "Kira", "Luca", "Mara", "Nadia", "Omar", "Paola",
  "Quinto", "Rita", "Saverio", "Tania",
];
const LAST_NAMES = [
  "Ricci", "Bruno", "Colombo", "Ferrari", "Esposito", "Greco", "Marino",
  "Rizzo", "Villa", "Conti", "Bianchi", "Gallo", "Costa", "Fontana",
];

// Deterministic PRNG so the mock dataset (and any screenshots/recordings
// of it) stays stable across reloads instead of reshuffling every time.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockRows(count: number, seed = 42): Row[] {
  const random = mulberry32(seed);
  const rows: Row[] = [];

  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    rows.push({
      id: `row-${i}`,
      name: `${first} ${last}`,
      department: DEPARTMENTS[Math.floor(random() * DEPARTMENTS.length)],
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      revenue: Math.round(random() * 48000 + 2000),
      lastActiveDaysAgo: Math.floor(random() * 30),
    });
  }

  return rows;
}

export const DEPARTMENT_OPTIONS = DEPARTMENTS;
export const STATUS_OPTIONS = STATUSES;
