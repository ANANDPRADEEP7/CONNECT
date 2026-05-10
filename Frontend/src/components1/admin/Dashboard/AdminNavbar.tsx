import { User, Menu } from "lucide-react";


const AdminNavbar = () => {


  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <img src="/logo.png" alt="Connect Logo" className="h-10 object-contain invert dark:invert-0" />
      </div>

      <div className="flex items-center gap-4">
        {/* <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-xs tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          SEARCH <Search size={14} />
        </button> */}
        <User size={20} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        <Menu size={20} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
      </div>
    </header>
  );
};

export default AdminNavbar;
