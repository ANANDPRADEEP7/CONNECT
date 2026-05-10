import React from "react";

// ─── Column Definition ────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key for this column */
  key: string;
  /** Header label shown in the (optional) header row */
  header?: string;
  /** Render function for each cell */
  render: (row: T) => React.ReactNode;
  /** Extra className applied to the cell wrapper */
  className?: string;
}

// ─── DataTable Props ──────────────────────────────────────────────────────────

export interface DataTableProps<T> {
  /** Array of data rows */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Key extractor – must return a unique string/number for each row */
  rowKey: (row: T) => string | number;
  /** Shown while data is being fetched */
  loading?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Message shown when data is empty */
  emptyText?: string;
  /** Optional slot rendered at the trailing end of every row (e.g. action buttons) */
  rowActions?: (row: T) => React.ReactNode;
  /** Extra className applied to every row card */
  rowClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  loadingText = "Loading...",
  emptyText = "No data found.",
  rowActions,
  rowClassName = "",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-pulse">
        {loadingText}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-12">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div
          key={rowKey(row)}
          className={`flex items-center justify-between bg-card border border-border rounded-xl px-6 py-4 flex-wrap gap-4 ${rowClassName}`}
        >
          {columns.map((col) => (
            <div key={col.key} className={col.className ?? ""}>
              {col.render(row)}
            </div>
          ))}

          {rowActions && (
            <div className="flex gap-2 ml-auto">{rowActions(row)}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DataTable;
