import { useState, useEffect } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";
import {
  DataTable,
  UserAvatar,
  ManagementHeader,
  type ColumnDef,
} from "../../../components1/common/table";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getUsers(page, limit);
        setUsers(response.data);
        setTotalPages(response.totalPages || 1);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to toggle block status"
      );
    }
  };

  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: ColumnDef<UserItem>[] = [
    {
      key: "user",
      render: (user) => (
        <UserAvatar
          name={user.name}
          badge={
            user.verified ? (
              <svg
                className="w-4 h-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : undefined
          }
        />
      ),
    },
    {
      key: "email",
      render: (user) => (
        <span className="text-sm text-muted-foreground hidden sm:block">
          {user.email}
        </span>
      ),
    },
    {
      key: "phone",
      render: (user) => (
        <span className="text-sm text-muted-foreground hidden md:block">
          {user.phone}
        </span>
      ),
    },
  ];

  // ─── Row Actions ───────────────────────────────────────────────────────────

  const rowActions = (user: UserItem) => (
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
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <ManagementHeader title="USER MANAGEMENT">
        <button className="px-6 py-2.5 rounded-full bg-blue-500 text-xs tracking-[0.15em] font-semibold text-white hover:bg-blue-600 transition-colors">
          VERIFY REQUEST
        </button>
      </ManagementHeader>

      <DataTable
        data={users}
        columns={columns}
        rowKey={(u) => u.id}
        loading={loading}
        loadingText="Loading users..."
        emptyText="No users found."
        rowActions={rowActions}
      />
      
      {/* Pagination Controls */}
      {!loading && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-full text-xs font-semibold disabled:opacity-50 hover:bg-accent transition-colors"
          >
            PREVIOUS
          </button>
          <span className="text-xs text-muted-foreground font-semibold">
            PAGE {page} OF {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-border rounded-full text-xs font-semibold disabled:opacity-50 hover:bg-accent transition-colors"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
