import { useState } from "react";
import { Search, ChevronDown, User, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { clearUser } from "../../../store/slices/authSlice";
import { userApi } from "../../../Endpoints/Api/user/userApi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userApi.Logout();
    } catch (error) {
      console.error("Logout failed on server:", error);
    }
    dispatch(clearUser());
    toast.success("Logged out successfully");
    navigate("/user/login");
  };

  const userRole = user?.role;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center">
          <img src="/logo.png" alt="Connect Logo" className="h-16 object-contain invert dark:invert-0" />
        </Link>

        {/* Right nav */}
        <div className="hidden md:flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm tracking-widest uppercase text-foreground hover:bg-secondary transition-colors">
            Search <Search size={16} />
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors">
            About Us <ChevronDown size={14} />
          </button>
          {userRole === "rider" || user?.isRiderActive === "active" ? (
            <Link
              to="/post-ride"
              className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm tracking-widest uppercase font-semibold hover:bg-blue-700 transition-colors"
            >
              Post a Ride
            </Link>
          ) : user?.isRiderActive === "pending" ? (
            <Link
              to="/Profile"
              className="px-6 py-2.5 rounded-full bg-yellow-500/20 text-yellow-600 text-sm tracking-widest uppercase font-semibold hover:bg-yellow-500/30 transition-colors"
            >
              Pending Approval
            </Link>
          ) : (
            <Link
              to="/Profile"
              className="px-6 py-2.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase font-semibold hover:opacity-90 transition-opacity"
            >
              Become a Rider
            </Link>
          )}
          <Link to="/Profile" className="p-2 text-foreground hover:text-muted-foreground transition-colors">
            <User size={22} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-foreground hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border/30 px-6 py-6 space-y-4">
          {!user ? (
            <>
              <Link to="/user/login" className="block text-sm tracking-widest uppercase text-foreground">Login</Link>
              <Link to="/" className="block text-sm tracking-widest uppercase text-foreground">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/home" className="block text-sm tracking-widest uppercase text-foreground">Home</Link>
              <Link to="/Profile" className="block text-sm tracking-widest uppercase text-foreground">Profile</Link>
              <button
                onClick={handleLogout}
                className="block text-sm tracking-widest uppercase text-red-500 text-left w-full"
              >
                Logout
              </button>
            </>
          )}
          <a href="#" className="block text-sm tracking-widest uppercase text-foreground">About Us</a>
          {userRole === "rider" || user?.isRiderActive === "active" ? (
            <Link to="/post-ride" className="block text-sm tracking-widest uppercase text-foreground">Post a Ride</Link>
          ) : user?.isRiderActive === "pending" ? (
            <Link to="/Profile" className="block text-sm tracking-widest uppercase text-yellow-600">Pending Approval</Link>
          ) : user && (
            <Link to="/Profile" className="block text-sm tracking-widest uppercase text-foreground">Become a Rider</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
