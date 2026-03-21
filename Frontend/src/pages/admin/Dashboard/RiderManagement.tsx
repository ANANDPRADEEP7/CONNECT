import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../../../Endpoints/Api/Admin/adminApi";

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

const statusConfig: Record<RiderStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "PENDING" },
  approved: { icon: CheckCircle, color: "text-green-500", label: "APPROVED" },
  rejected: { icon: XCircle, color: "text-destructive", label: "REJECTED" },
};

const RiderManagement = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RiderStatus | "all">("all");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const data = await adminApi.getRiders();
        setRiders(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch riders");
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update rider status");
    }
  };

  const filtered = filter === "all" ? riders : riders.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2
          className="text-xl tracking-[0.15em] font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          RIDER MANAGEMENT
        </h2>

        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-center py-10 text-muted-foreground">Loading riders...</div>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">No riders found</p>
        )}
        {filtered.map((rider) => {
          const cfg = statusConfig[rider.status];
          const StatusIcon = cfg.icon;

          return (
            <div
              key={rider.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-6 py-4 flex-wrap gap-4"
            >
              <div className="flex items-center gap-4 min-w-[180px]">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border-2 border-blue-500/50">
                  <span className="text-sm font-semibold text-foreground">
                    {rider.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{rider.name}</p>
                </div>
              </div>

              <span className="text-sm text-muted-foreground hidden sm:block">{rider.email}</span>
              <span className="text-sm text-muted-foreground hidden md:block">{rider.phone}</span>

              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-[10px] tracking-wider font-semibold ${cfg.color}`}>
                  <StatusIcon size={14} /> {cfg.label}
                </span>
              </div>

              <div className="flex gap-2">
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Rider Details Modal */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold tracking-wider uppercase">Rider Documents</h3>
              <button
                onClick={() => setSelectedRider(null)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 col-span-full">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bio</p>
                <p className="text-sm text-foreground bg-accent/30 p-4 rounded-xl">
                  {selectedRider.bio || "No bio provided."}
                </p>
              </div>

              {[
                { label: "Government ID", path: selectedRider.govId },
                { label: "Vehicle Image", path: selectedRider.vehicleImage },
                { label: "PUC Certificate", path: selectedRider.pucImage },
                { label: "RC Book", path: selectedRider.rcImage },
              ].map((doc) => (
                <div key={doc.label} className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{doc.label}</p>
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
                          src={`http://localhost:3000${doc.path}`}
                          alt={doc.label}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => window.open(`http://localhost:3000${doc.path}`, "_blank")}
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
      )}
    </div>
  );
};

export default RiderManagement;
