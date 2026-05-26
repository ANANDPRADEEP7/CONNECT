import { useState, useEffect, useRef } from "react";
import { Shield, ShieldOff, Search, Filter } from "lucide-react";
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

// ─── Confirmation Modal ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  user: UserItem;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBlockModal = ({ user, onConfirm, onCancel }: ConfirmModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
      <h3 className="text-sm font-bold tracking-wider uppercase">
        {user.blocked ? "Unblock User" : "Block User"}
      </h3>
      <p className="text-sm text-muted-foreground">
        Are you sure you want to{" "}
        <span className="font-semibold text-foreground">
          {user.blocked ? "unblock" : "block"}
        </span>{" "}
        <span className="font-semibold text-foreground">{user.name}</span>?
        {!user.blocked && (
          <span className="block mt-1">
            They will no longer be able to log in.
          </span>
        )}
      </p>
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-accent transition-colors"
        >
          CANCEL
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            user.blocked
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-destructive text-destructive-foreground hover:opacity-90"
          }`}
        >
          {user.blocked ? "UNBLOCK" : "BLOCK"}
        </button>
      </div>
    </div>
  </div>
);

// ─── UserManagement ────────────────────────────────────────────────────────────

const UserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmUser, setConfirmUser] = useState<UserItem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const processingRef = useRef<Set<string>>(new Set());
  const limit = 10;

  // Handle Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getUsers(page, limit, debouncedSearch, filter !== "all" ? filter : undefined);
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
  }, [page, debouncedSearch, filter]);

  const handleBlockConfirm = async () => {
    if (!confirmUser) return;
    const id = confirmUser.id;

    // Prevent double request
    if (processingRef.current.has(id)) return;
    processingRef.current.add(id);
    setConfirmUser(null);

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
      toast.error(err.response?.data?.message || "Failed to toggle block status");
    } finally {
      processingRef.current.delete(id);
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
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
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
        <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
      ),
    },
    {
      key: "phone",
      render: (user) => (
        <span className="text-sm text-muted-foreground hidden md:block">{user.phone}</span>
      ),
    },
  ];

  // ─── Row Actions ───────────────────────────────────────────────────────────

  const rowActions = (user: UserItem) => (
    <button
      onClick={() => setConfirmUser(user)}
      disabled={processingRef.current.has(user.id)}
      className={`px-6 py-2 rounded-full text-xs tracking-[0.15em] font-semibold border transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
            <input
              type="text"
              placeholder="SEARCH USERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-full bg-accent/30 border border-border focus:border-primary/50 focus:bg-accent/50 outline-none text-[10px] tracking-widest font-semibold w-48 sm:w-64 transition-all"
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-full bg-accent/30 border border-border focus:border-primary/50 outline-none text-[10px] tracking-widest font-semibold appearance-none cursor-pointer hover:bg-accent/50 transition-all"
            >
              <option value="all">ALL USERS</option>
              <option value="blocked">BLOCKED</option>
              <option value="unblocked">ACTIVE</option>
            </select>
          </div>
        </div>
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

      {/* Block Confirmation Modal */}
      {confirmUser && (
        <ConfirmBlockModal
          user={confirmUser}
          onConfirm={handleBlockConfirm}
          onCancel={() => setConfirmUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
