import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  IndianRupee,
  Users,
  Eye
} from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";
import {
  DataTable,
  UserAvatar,
  ManagementHeader,
  type ColumnDef,
} from "../../../components1/common/table";
import type { AdminRideItem, AdminRidesStats } from "../../../types/admin/admin.types";

// ─── Confirm Action Modal ──────────────────────────────────────────────────────

interface ActionModalProps {
  ride: AdminRideItem;
  action: "approve" | "suspend" | "cancel";
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const ActionConfirmModal = ({ ride, action, onConfirm, onCancel, loading }: ActionModalProps) => {
  const [reason, setReason] = useState("");

  const getActionStyles = () => {
    switch (action) {
      case "approve":
        return {
          title: "Approve Ride",
          desc: "Are you sure you want to approve this ride? It will be visible for users to search and book.",
          btnText: "APPROVE",
          btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
        };
      case "suspend":
        return {
          title: "Suspend Ride",
          desc: "Are you sure you want to suspend this ride? It will be hidden from search results.",
          btnText: "SUSPEND",
          btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
        };
      case "cancel":
        return {
          title: "Cancel Ride",
          desc: "Are you sure you want to cancel this ride? This action is irreversible.",
          btnText: "CANCEL RIDE",
          btnClass: "bg-red-600 hover:bg-red-500 text-white",
        };

    }
  };

  const styles = getActionStyles();

  const handleConfirmClick = () => {
    if (action === "cancel" && !reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    onConfirm(action === "cancel" ? reason : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
          {styles.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {styles.desc}
          <span className="block mt-2 font-bold text-foreground">
            {ride.from.name} → {ride.to.name} ({ride.date})
          </span>
        </p>

        {action === "cancel" && (
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Reason</label>
            <textarea
              placeholder="Provide a reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-red-500/50 resize-none placeholder:text-muted-foreground/50"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${styles.btnClass} disabled:opacity-50`}
          >
            {loading ? "PROCESSING..." : styles.btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

interface RideDetailDrawerProps {
  ride: AdminRideItem;
  onClose: () => void;
}

const RideDetailDrawer = ({ ride, onClose }: RideDetailDrawerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-0 transition-opacity animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col p-6 shadow-2xl overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">
            Ride Details
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs font-semibold uppercase tracking-wider">
            CLOSE
          </button>
        </div>

        <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-xl">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Ride ID</p>
            <p className="text-xs font-bold text-foreground">{ride.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${ride.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              ride.status === "completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                ride.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
            {ride.status}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Route & Timing</h4>

          <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center mt-1 shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-foreground flex items-center justify-center text-[8px] font-black text-background">S</div>
                <div className="w-0.5 h-10 bg-border my-1" />
                <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground bg-background" />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Source</p>
                  <p className="text-xs font-black text-foreground">{ride.from.name}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Destination</p>
                  <p className="text-xs font-black text-foreground">{ride.to.name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/20 text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5"><Calendar size={13} /> {ride.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {ride.time}</span>
              {ride.distance && <span className="flex items-center gap-1.5"><Navigation size={13} /> {ride.distance}</span>}
            </div>
          </div>
        </div>

        {ride.cancellation && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black tracking-widest uppercase text-red-500">Cancellation Details</h4>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-red-500/70 font-black">Cancelled By</span>
                <span className="text-xs font-bold text-red-500">{ride.cancellation.cancelledBy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-red-500/70 font-black">Date</span>
                <span className="text-xs font-bold text-red-500">{new Date(ride.cancellation.timestamp).toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-2 border-t border-red-500/20">
                <span className="text-[10px] uppercase tracking-widest text-red-500/70 font-black block mb-1">Reason</span>
                <p className="text-xs text-red-500 font-medium leading-relaxed">"{ride.cancellation.reason}"</p>
              </div>
            </div>
          </div>
        )}

        {ride.stopovers && ride.stopovers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Stopovers</h4>
            <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-3">
              {ride.stopovers.map((stop, idx) => (
                <div key={stop.id || idx} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-foreground">{stop.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Driver Details</h4>
          <div className="flex items-center gap-3 bg-secondary/10 border border-border/40 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-secondary/80 border border-border flex items-center justify-center font-black text-sm text-foreground">
              {ride.driver.avatar}
            </div>
            <div>
              <p className="text-xs font-black text-foreground">{ride.driver.name}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{ride.driver.email}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{ride.driver.phone}</p>
            </div>
          </div>
        </div>

        {ride.vehicle && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Vehicle Details</h4>
            <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-foreground">{ride.vehicle.name} ({ride.vehicle.color || "White"})</p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Capacity: {ride.vehicle.capacity} seats</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-2">
            <h5 className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Seats Booked</h5>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground">{ride.bookedSeats} / {ride.seats}</span>
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase">Booked</span>
            </div>
            <div className="w-full bg-secondary/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${(ride.bookedSeats / ride.seats) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-secondary/10 border border-border/40 rounded-2xl p-4 space-y-1">
            <h5 className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Fare Per Seat</h5>
            <p className="text-lg font-black text-foreground flex items-center"><IndianRupee size={16} />{ride.pricePerSeat}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Fixed Cost</p>
          </div>
        </div>

        {ride.description && (
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Driver Notes</h4>
            <p className="text-xs text-muted-foreground italic font-medium leading-relaxed bg-secondary/10 border border-border/30 rounded-2xl p-4">
              "{ride.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── RidesManagement ───────────────────────────────────────────────────────────

const RidesManagement = () => {
  const [rides, setRides] = useState<AdminRideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState<AdminRidesStats>({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    suspendedRides: 0,
  });

  const [activeAction, setActiveAction] = useState<{ ride: AdminRideItem, action: "approve" | "suspend" | "cancel" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDetailRide, setSelectedDetailRide] = useState<AdminRideItem | null>(null);

  const processingRef = useRef<Set<string>>(new Set());
  const limit = 10;

  // Handle Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getRides(
        page,
        limit,
        debouncedSearch || undefined,
        filter !== "all" ? filter : undefined
      );
      if (response && response.data) {
        setRides(response.data);
        setTotalPages(response.totalPages || 1);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        toast.error(response.message || "Failed to fetch rides");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch rides";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page, debouncedSearch, filter]);

  const handleActionConfirm = async (reason?: string) => {
    if (!activeAction) return;
    const { ride, action } = activeAction;
    const rideId = ride.id;

    if (processingRef.current.has(rideId)) return;
    processingRef.current.add(rideId);
    setActionLoading(true);

    try {

        const statusMap = {
          approve: "active",
          suspend: "suspended",
          cancel: "cancelled"
        } as const;

        const response = await adminApi.updateRideStatus(rideId, statusMap[action], action === "cancel" ? reason : undefined);
        toast.success(response.message || `Ride ${action}d successfully`);
        fetchRides();
      setActiveAction(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Action failed";
      toast.error(errorMsg);
    } finally {
      processingRef.current.delete(rideId);
      setActionLoading(false);
    }
  };

  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: ColumnDef<AdminRideItem>[] = [
    {
      key: "driver",
      header: "DRIVER",
      render: (ride) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={ride.driver.name} />
          <div>
            <p className="text-xs font-bold text-foreground leading-none">{ride.driver.name}</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-none">{ride.driver.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "route",
      header: "ROUTE",
      render: (ride) => (
        <div>
          <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{ride.from.name} → {ride.to.name}</p>
          <p className="text-[9px] text-muted-foreground font-black tracking-wider uppercase mt-1">
            {ride.date} @ {ride.time}
          </p>
        </div>
      ),
    },
    {
      key: "bookedSeats",
      header: "SEATS",
      render: (ride) => (
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-foreground">
            {ride.bookedSeats} / {ride.seats}
          </p>
          <span className="text-[9px] text-muted-foreground font-black uppercase">
            Booked
          </span>
        </div>
      ),
    },
    {
      key: "fare",
      header: "FARE",
      render: (ride) => (
        <div>
          <p className="text-xs font-bold text-foreground">₹{ride.pricePerSeat}</p>
          <span className="text-[9px] text-muted-foreground font-black uppercase">Per Seat</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (ride) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border inline-block ${ride.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
            ride.status === "completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              ride.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
          {ride.status}
        </span>
      ),
    },
  ];

  // ─── Row Actions ───────────────────────────────────────────────────────────

  const rowActions = (ride: AdminRideItem) => {
    const isProcessing = processingRef.current.has(ride.id);

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDetailRide(ride)}
          className="p-2 rounded-full border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="View Details"
        >
          <Eye size={13} />
        </button>

        {ride.status === "suspended" && (
          <button
            onClick={() => setActiveAction({ ride, action: "approve" })}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-full text-[9px] tracking-widest font-black uppercase bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            title="Approve Ride"
          >
            APPROVE
          </button>
        )}

        {ride.status === "active" && (
          <>
            <button
              onClick={() => setActiveAction({ ride, action: "suspend" })}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-[9px] tracking-widest font-black uppercase bg-amber-600 text-white hover:bg-amber-500 transition-colors disabled:opacity-50"
              title="Suspend Ride"
            >
              SUSPEND
            </button>
            <button
              onClick={() => setActiveAction({ ride, action: "cancel" })}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-[9px] tracking-widest font-black uppercase bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              title="Cancel Ride"
            >
              CANCEL
            </button>
          </>
        )}


      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "TOTAL RIDES", value: stats.totalRides, color: "text-foreground border-border/40" },
          { label: "ACTIVE RIDES", value: stats.activeRides, color: "text-primary border-primary/20" },
          { label: "COMPLETED RIDES", value: stats.completedRides, color: "text-emerald-400 border-emerald-500/20" },
          { label: "CANCELLED RIDES", value: stats.cancelledRides, color: "text-red-400 border-red-500/20" },
          { label: "SUSPENDED RIDES", value: stats.suspendedRides, color: "text-amber-400 border-amber-500/20" },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-card border rounded-2xl p-4 flex flex-col justify-between ${stat.color}`}>
            <span className="text-[9px] tracking-widest font-black uppercase text-muted-foreground">{stat.label}</span>
            <span className="text-2xl font-black mt-2">{stat.value}</span>
          </div>
        ))}
      </div>

      <ManagementHeader title="MANAGE RIDES">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY ROUTE, DRIVER..."
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
              className="pl-9 pr-8 py-2.5 rounded-full bg-accent/30 border border-border focus:border-primary/50 outline-none text-[10px] tracking-widest font-semibold appearance-none cursor-pointer hover:bg-accent/50 transition-all uppercase"
            >
              <option value="all">ALL RIDES</option>
              <option value="upcoming">UPCOMING</option>
              <option value="ongoing">ONGOING</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
              <option value="suspended">SUSPENDED</option>
            </select>
          </div>
        </div>
      </ManagementHeader>

      <DataTable
        data={rides}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
        loadingText="Loading rides..."
        emptyText="No rides found."
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

      {/* Action confirmation dialog */}
      {activeAction && (
        <ActionConfirmModal
          ride={activeAction.ride}
          action={activeAction.action}
          onConfirm={handleActionConfirm}
          onCancel={() => setActiveAction(null)}
          loading={actionLoading}
        />
      )}

      {/* Detailed Slide-over Drawer */}
      {selectedDetailRide && (
        <RideDetailDrawer
          ride={selectedDetailRide}
          onClose={() => setSelectedDetailRide(null)}
        />
      )}
    </div>
  );
};

export default RidesManagement;
