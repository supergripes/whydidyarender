import { DEPARTMENT_OPTIONS, STATUS_OPTIONS, generateMockRows } from "./mockData";

describe("generateMockRows", () => {
  it("generates the requested number of rows with unique ids", () => {
    const rows = generateMockRows(60);

    expect(rows).toHaveLength(60);
    expect(new Set(rows.map((row) => row.id)).size).toBe(60);
  });

  it("keeps every field within its expected domain", () => {
    const rows = generateMockRows(60);

    for (const row of rows) {
      expect(DEPARTMENT_OPTIONS).toContain(row.department);
      expect(STATUS_OPTIONS).toContain(row.status);
      expect(row.revenue).toBeGreaterThanOrEqual(2000);
      expect(row.revenue).toBeLessThanOrEqual(50000);
      expect(row.lastActiveDaysAgo).toBeGreaterThanOrEqual(0);
      expect(row.lastActiveDaysAgo).toBeLessThan(30);
    }
  });

  it("is deterministic for a given seed", () => {
    const first = generateMockRows(10, 42);
    const second = generateMockRows(10, 42);

    expect(second).toEqual(first);
  });

  it("produces a different dataset for a different seed", () => {
    const seed42 = generateMockRows(10, 42);
    const seed7 = generateMockRows(10, 7);

    expect(seed7).not.toEqual(seed42);
  });
});
