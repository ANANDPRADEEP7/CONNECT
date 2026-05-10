import React from "react";

interface ManagementHeaderProps {
  title: string;
  children?: React.ReactNode; // filter buttons / action buttons
}

const ManagementHeader = ({ title, children }: ManagementHeaderProps) => (
  <div className="flex items-center justify-between flex-wrap gap-4">
    <h2
      className="text-xl tracking-[0.15em] font-bold text-foreground"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {title}
    </h2>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

export default ManagementHeader;
