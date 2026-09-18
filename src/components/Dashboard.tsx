import { memo, useEffect, useMemo, useState } from "react";
import {
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  generateMockRows,
  type Department,
  type Row,
  type Status,
} from "../data/mockData";

const ALL_DEPARTMENTS = "all" as const;
const ALL_STATUSES = "all" as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const STATUS_STYLES: Record<Status, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  paused: "bg-amber-500/15 text-amber-400",
  archived: "bg-neutral-500/15 text-neutral-400",
};

export default function Dashboard() {
  const rows = useMemo(() => generateMockRows(60), []);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<Department | typeof ALL_DEPARTMENTS>(ALL_DEPARTMENTS);
  const [status, setStatus] = useState<Status | typeof ALL_STATUSES>(ALL_STATUSES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // A high-frequency, mostly-irrelevant piece of state living at the top
  // of the tree: the classic setup for a re-render cascade. Everything
  // downstream re-renders once a second whether it cares about the tick
  // or not, unless it's actually memoized against stable props.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredRows = rows.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department === ALL_DEPARTMENTS || row.department === department;
    const matchesStatus = status === ALL_STATUSES || row.status === status;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Recreated on every render on purpose: nothing here is wrapped in
  // useCallback. TableRow below is wrapped in React.memo as a naive
  // optimization attempt, but a fresh function identity on every render
  // defeats that memoization anyway, so every visible row still
  // re-renders on every keystroke, filter change, or clock tick.
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-100">whydidyarender</h1>
        <p className="text-sm text-neutral-400">
          A dashboard engineered to re-render more than it should. Tick: {tick}s
        </p>
      </header>

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        status={status}
        onStatusChange={setStatus}
      />

      <StatsBar
        totalRows={rows.length}
        visibleRows={filteredRows.length}
        selectedRows={selectedIds.size}
        totalRevenue={totalRevenue}
      />

      <Table rows={filteredRows} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
    </div>
  );
}

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: Department | typeof ALL_DEPARTMENTS;
  onDepartmentChange: (value: Department | typeof ALL_DEPARTMENTS) => void;
  status: Status | typeof ALL_STATUSES;
  onStatusChange: (value: Status | typeof ALL_STATUSES) => void;
}

function Toolbar({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name…"
        className="flex-1 min-w-[180px] rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
      />
      <select
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value as Department | typeof ALL_DEPARTMENTS)}
        className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none"
      >
        <option value={ALL_DEPARTMENTS}>All departments</option>
        {DEPARTMENT_OPTIONS.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as Status | typeof ALL_STATUSES)}
        className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none"
      >
        <option value={ALL_STATUSES}>All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

interface StatsBarProps {
  totalRows: number;
  visibleRows: number;
  selectedRows: number;
  totalRevenue: number;
}

function StatsBar({ totalRows, visibleRows, selectedRows, totalRevenue }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total rows" value={totalRows.toString()} />
      <StatCard label="Visible" value={visibleRows.toString()} />
      <StatCard label="Selected" value={selectedRows.toString()} />
      <StatCard label="Revenue (visible)" value={currencyFormatter.format(totalRevenue)} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-100">{value}</p>
    </div>
  );
}

interface TableProps {
  rows: Row[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

function Table({ rows, selectedIds, onToggleSelect }: TableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800">
      <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_1fr] gap-2 bg-neutral-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
        <span />
        <span>Name</span>
        <span>Department</span>
        <span>Status</span>
        <span>Revenue</span>
        <span>Last active</span>
      </div>
      <div className="divide-y divide-neutral-800">
        {rows.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            isSelected={selectedIds.has(row.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}

interface TableRowProps {
  row: Row;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

// Wrapped in memo() as a naive optimization attempt: the kind a
// developer adds after profiling and seeing rows re-render too often.
// It only works if row/isSelected/onToggleSelect all stay referentially
// stable across parent renders; today they don't, so this memo is a
// no-op in practice.
const TableRow = memo(function TableRow({ row, isSelected, onToggleSelect }: TableRowProps) {
  return (
    <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-2 text-sm text-neutral-200">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(row.id)}
        className="h-4 w-4 rounded border-neutral-600 bg-neutral-950"
      />
      <span className="font-medium text-neutral-100">{row.name}</span>
      <span className="text-neutral-400">{row.department}</span>
      <span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status]}`}>
          {row.status}
        </span>
      </span>
      <span className="tabular-nums text-neutral-400">{currencyFormatter.format(row.revenue)}</span>
      <span className="text-neutral-500">
        {row.lastActiveDaysAgo === 0 ? "today" : `${row.lastActiveDaysAgo}d ago`}
      </span>
    </div>
  );
});
