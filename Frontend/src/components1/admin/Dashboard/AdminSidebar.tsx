import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Users,
  Bike,
  Navigation,
  CalendarCheck,
  FileText,
  CreditCard,
  LogOut,
} from "lucide-react";

// ... items ...
const navItems = [
  { label: "ADMIN DASHBOARD", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "USER MANAGEMENT", path: "/admin/users", icon: Users },
  { label: "RIDER DASHBOARD", path: "/admin/riders", icon: Bike },
  { label: "TRAVELLER DASHBOARD", path: "/admin/dashboard", icon: Navigation },
  { label: "YOUR RIDES", path: "/admin/dashboard", icon: Navigation },
  { label: "BOOKINGS", path: "/admin/dashboard", icon: CalendarCheck },
  { label: "REPORTS", path: "/admin/dashboard", icon: FileText },
  { label: "PAYMENTS & REFUND", path: "/admin/dashboard", icon: CreditCard },
];

const AdminSidebar = () => {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    toast.success("Admin logged out successfully");
    navigate("/Admin/login");
  };

  return (
    <aside className="w-52 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-[11px] tracking-[0.15em] font-medium transition-colors ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-4 text-[11px] tracking-[0.15em] font-medium text-muted-foreground hover:text-foreground border-t border-border transition-colors w-full text-left"
      >
        <LogOut size={16} />
        LOG OUT
      </button>
    </aside>
  );
};

export default AdminSidebar;
