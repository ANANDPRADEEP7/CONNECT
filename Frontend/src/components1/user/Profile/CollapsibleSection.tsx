import { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, subtitle, children }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 text-left group"
      >
        {open ? (
          <MinusCircle size={20} className="text-blue-400 shrink-0" />
        ) : (
          <PlusCircle size={20} className="text-blue-400 shrink-0" />
        )}
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground ml-1 normal-case tracking-normal">{subtitle}</span>
        )}
      </button>
      {open && <div className="pb-3 pt-1 pl-8">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
