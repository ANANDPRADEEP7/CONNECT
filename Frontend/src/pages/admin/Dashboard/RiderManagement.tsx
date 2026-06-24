import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Search, Filter } from "lucide-react";
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
  rejectionReason?: string | null;
  vehicles?: {
    id: string;
    name: string;
    model?: string;
    color?: string;
    capacity: number;
    rcNumber?: string;
    type?: string;
    images?: string[];
  }[];
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

        {/* Rejection Reason Banner */}
        {rider.status === "rejected" && rider.rejectionReason && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-destructive uppercase tracking-widest mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-foreground">{rider.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rider Details */}
          <div className="space-y-4 col-span-full">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Rider Details
            </p>
            <div className="bg-accent/30 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Name</p>
                <p className="text-sm font-semibold text-foreground">{rider.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{rider.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-sm font-medium text-foreground">{rider.phone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4 col-span-full">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Bio
            </p>
            <p className="text-sm text-foreground bg-accent/30 p-4 rounded-xl">
              {rider.bio || "No bio provided."}
            </p>
          </div>

          {/* Vehicles */}
          {rider.vehicles && rider.vehicles.length > 0 && (
            <div className="space-y-4 col-span-full">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Vehicles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rider.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-accent/30 border border-border p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-foreground">{vehicle.name}</p>
                        {vehicle.model && <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{vehicle.model}</p>}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {vehicle.type || "Vehicle"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">RC Number</p>
                        <p className="font-semibold text-foreground">{vehicle.rcNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Capacity</p>
                        <p className="font-semibold text-foreground">{vehicle.capacity} Seats</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Color</p>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          {vehicle.color && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-border inline-block" 
                              style={{ backgroundColor: vehicle.color.toLowerCase() }} 
                            />
                          )}
                          {vehicle.color || "N/A"}
                        </p>
                      </div>
                    </div>
                    {vehicle.images && vehicle.images.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {vehicle.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`${vehicle.name} - ${idx + 1}`} 
                            className="w-16 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border"
                            onClick={() => window.open(img, "_blank")}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      key={doc.path} // Force re-render when image URL changes
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

// ─── Rejection Reason Modal ───────────────────────────────────────────────────

interface RejectModalProps {
  rider: Rider;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const RejectReasonModal = ({ rider, onConfirm, onCancel }: RejectModalProps) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-sm font-bold tracking-wider uppercase">Reject Rider Application</h3>
        <p className="text-sm text-muted-foreground">
          You are rejecting{" "}
          <span className="font-semibold text-foreground">{rider.name}</span>'s application.
          Please provide a reason.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={3}
          className="w-full bg-accent/30 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-destructive"
        />
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-accent transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || "No reason provided.")}
            className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            CONFIRM REJECT
          </button>
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [rejectingRider, setRejectingRider] = useState<Rider | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    const fetchRiders = async () => {
      setLoading(true);
      try {
        const response = await adminApi.getRiders(page, limit, debouncedSearch, filter !== "all" ? filter : undefined);
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
  }, [page, debouncedSearch, filter]);

  const updateStatus = async (id: string, status: RiderStatus, rejectionReason?: string) => {
    if (processingIds.has(id)) return;
    setProcessingIds((prev) => new Set(prev).add(id));

    try {
      const backendStatus = status === "approved" ? "active" : "declined";
      const result = await adminApi.updateRiderStatus(id, backendStatus, rejectionReason);
      setRiders((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            toast.success(result.message);
            return { ...r, status, rejectionReason: rejectionReason ?? r.rejectionReason };
          }
          return r;
        })
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update rider status");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingRider) return;
    const rider = rejectingRider;
    setRejectingRider(null);
    updateStatus(rider.id, "rejected", reason);
  };

  const filtered = riders;

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

  const isFinalized = (rider: Rider) =>
    rider.status === "approved" || rider.status === "rejected";

  const rowActions = (rider: Rider) => (
    <>
      <button
        onClick={() => setSelectedRider(rider)}
        className="px-4 py-2 rounded-full border border-blue-500/50 text-blue-500 text-[10px] tracking-[0.15em] font-semibold hover:bg-blue-500/10 transition-colors flex items-center gap-2"
      >
        <Eye size={14} /> VIEW DETAILS
      </button>

      {!isFinalized(rider) && (
        <>
          <button
            onClick={() => updateStatus(rider.id, "approved")}
            disabled={processingIds.has(rider.id)}
            className="px-4 py-2 rounded-full bg-green-600 text-white text-[10px] tracking-[0.15em] font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            APPROVE
          </button>

          <button
            onClick={() => setRejectingRider(rider)}
            disabled={processingIds.has(rider.id)}
            className="px-4 py-2 rounded-full border border-destructive text-destructive text-[10px] tracking-[0.15em] font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            REJECT
          </button>
        </>
      )}

      {isFinalized(rider) && (
        <span className="text-[10px] tracking-widest text-muted-foreground font-semibold uppercase">
          {rider.status === "approved" ? "✓ Approved" : "✗ Rejected"}
        </span>
      )}
    </>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <ManagementHeader title="RIDER MANAGEMENT">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
            <input
              type="text"
              placeholder="SEARCH RIDERS..."
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
                setFilter(e.target.value as RiderStatus | "all");
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-full bg-accent/30 border border-border focus:border-primary/50 outline-none text-[10px] tracking-widest font-semibold appearance-none cursor-pointer hover:bg-accent/50 transition-all"
            >
              <option value="all">ALL RIDERS</option>
              <option value="pending">PENDING</option>
              <option value="approved">APPROVED</option>
              <option value="rejected">REJECTED</option>
            </select>
          </div>
        </div>
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

      {rejectingRider && (
        <RejectReasonModal
          rider={rejectingRider}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingRider(null)}
        />
      )}
    </div>
  );
};

export default RiderManagement;
