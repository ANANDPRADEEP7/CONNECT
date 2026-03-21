import { useState, useEffect } from "react";

import { Shield, ShieldOff } from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        setUsers(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleBlock = async (id: string) => {
    try {
      const result = await adminApi.toggleBlockUser(id);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === id) {
            toast.success(result.message);
            return { ...u, blocked: result.isBlocked };
          }
          return u;
        })
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle block status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl tracking-[0.15em] font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          USER MANAGEMENT
        </h2>
        <button className="px-6 py-2.5 rounded-full bg-blue-500 text-xs tracking-[0.15em] font-semibold text-white hover:bg-blue-600 transition-colors">
          VERIFY REQUEST
        </button>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-center py-10 text-muted-foreground">Loading users...</div>}
        {!loading && users.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No users found.</div>
        )}
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-card border border-border rounded-xl px-6 py-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border-2 border-blue-500/50">
                <span className="text-sm font-semibold text-foreground">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                {user.verified && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
            </div>

            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <span className="text-sm text-muted-foreground hidden md:block">{user.phone}</span>

            <button
              onClick={() => toggleBlock(user.id)}
              className={`px-6 py-2 rounded-full text-xs tracking-[0.15em] font-semibold border transition-colors flex items-center gap-2 ${
                user.blocked
                  ? "bg-muted text-foreground border-border hover:bg-accent"
                  : "bg-primary text-primary-foreground border-transparent hover:opacity-90"
              }`}
            >
              {user.blocked ? (
                <>
                  <ShieldOff size={14} /> UNBLOCK
                </>
              ) : (
                <>
                  <Shield size={14} /> BLOCK
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
