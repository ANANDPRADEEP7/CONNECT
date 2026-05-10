import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";
import {
  DataTable,
  UserAvatar,
  ManagementHeader,
  type ColumnDef,
} from "../../../components1/common/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type RiderStatus = "pending" | "approved" | "rejected";

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: RiderStatus;
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
}

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  RiderStatus,
  { icon: typeof Clock; color: string; label: string }
> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "PENDING" },
  approved: { icon: CheckCircle, color: "text-green-500", label: "APPROVED" },
  rejected: { icon: XCircle, color: "text-destructive", label: "REJECTED" },
};

// ─── Document Viewer Modal ────────────────────────────────────────────────────

interface RiderModalProps {
  rider: Rider;
  onClose: () => void;
}

const RiderDocumentsModal = ({ rider, onClose }: RiderModalProps) => {
  const docs = [
    { label: "Government ID", path: rider.govId },
    { label: "Vehicle Image", path: rider.vehicleImage },
    { label: "PUC Certificate", path: rider.pucImage },
    { label: "RC Book", path: rider.rcImage },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-lg font-bold tracking-wider uppercase">
            Rider Documents
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          <div className="space-y-4 col-span-full">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Bio
            </p>
            <p className="text-sm text-foreground bg-accent/30 p-4 rounded-xl">
              {rider.bio || "No bio provided."}
            </p>
          </div>

          {/* Documents */}
          {docs.map((doc) => (
            <div key={doc.label} className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {doc.label}
              </p>
              {doc.path ? (
                <div className="border border-border rounded-xl overflow-hidden aspect-video bg-accent/20 flex items-center justify-center">
                  {doc.path.endsWith(".pdf") ? (
                    <a
                      href={doc.path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-500 hover:underline"
                    >
                      View PDF Document
                    </a>
                  ) : (
                    <img
                      src={doc.path}
                      alt={doc.label}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(doc.path, "_blank")}
                    />
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-xl aspect-video flex items-center justify-center text-xs text-muted-foreground">
                  Not uploaded
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── RiderManagement ──────────────────────────────────────────────────────────

const RiderManagement = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RiderStatus | "all">("all");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchRiders = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getRiders(page, limit);
        setRiders(response.data);
        setTotalPages(response.totalPages || 1);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to fetch riders");
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, [page]);

  const updateStatus = async (id: string, status: RiderStatus) => {
    try {
      const backendStatus = status === "approved" ? "active" : "declined";
      const result = await adminApi.updateRiderStatus(id, backendStatus);
      setRiders((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            toast.success(result.message);
            return { ...r, status };
          }
          return r;
        })
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update rider status"
      );
    }
  };

  const filtered =
    filter === "all" ? riders : riders.filter((r) => r.status === filter);

  // ─── Column Definitions ──────────────────────────────────────────────────

  const columns: ColumnDef<Rider>[] = [
    {
      key: "user",
      render: (rider) => <UserAvatar name={rider.name} />,
    },
    {
      key: "email",
      render: (rider) => (
        <span className="text-sm text-muted-foreground hidden sm:block">
          {rider.email}
        </span>
      ),
    },
    {
      key: "phone",
      render: (rider) => (
        <span className="text-sm text-muted-foreground hidden md:block">
          {rider.phone}
        </span>
      ),
    },
    {
      key: "status",
      render: (rider) => {
        const cfg = statusConfig[rider.status];
        const StatusIcon = cfg.icon;
        return (
          <span
            className={`flex items-center gap-1 text-[10px] tracking-wider font-semibold ${cfg.color}`}
          >
            <StatusIcon size={14} /> {cfg.label}
          </span>
        );
      },
    },
  ];

  // ─── Row Actions ─────────────────────────────────────────────────────────

  const rowActions = (rider: Rider) => (
    <>
      <button
        onClick={() => setSelectedRider(rider)}
        className="px-4 py-2 rounded-full border border-blue-500/50 text-blue-500 text-[10px] tracking-[0.15em] font-semibold hover:bg-blue-500/10 transition-colors flex items-center gap-2"
      >
        <Eye size={14} /> VIEW DETAILS
      </button>

      {rider.status !== "approved" && (
        <button
          onClick={() => updateStatus(rider.id, "approved")}
          className="px-4 py-2 rounded-full bg-green-600 text-white text-[10px] tracking-[0.15em] font-semibold hover:bg-green-700 transition-colors"
        >
          APPROVE
        </button>
      )}

      {rider.status !== "rejected" && (
        <button
          onClick={() => updateStatus(rider.id, "rejected")}
          className="px-4 py-2 rounded-full border border-destructive text-destructive text-[10px] tracking-[0.15em] font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          REJECT
        </button>
      )}
    </>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <ManagementHeader title="RIDER MANAGEMENT">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[10px] tracking-[0.15em] font-semibold uppercase border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f}
          </button>
        ))}
      </ManagementHeader>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
        loadingText="Loading riders..."
        emptyText="No riders found."
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

      {selectedRider && (
        <RiderDocumentsModal
          rider={selectedRider}
          onClose={() => setSelectedRider(null)}
        />
      )}
    </div>
  );
};

export default RiderManagement;
