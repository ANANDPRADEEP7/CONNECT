import { useState, useEffect } from "react";
import { Clock, Calendar, Users, Edit, Trash2, CheckCircle, XCircle, X, MapPin, IndianRupee, FileText, Save, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { rideApi } from "../../../Endpoints/Api/ride/rideApi";
import { bookingApi, type BookingResponse } from "../../../Endpoints/Api/booking/bookingApi";
import type { Ride } from "../../../types/ride/ride.types";

// ── View Details Modal ────────────────────────────────────────────────────────
const ViewDetailsModal = ({ ride, onClose }: { ride: Ride; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-card w-full max-w-lg rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-border/40">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">Ride Details</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors"><X size={18} /></button>
      </div>
      <div className="px-8 py-6 space-y-5 overflow-y-auto max-h-[70vh]">
        {/* Status + Price */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${ride.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : ride.status === "completed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>{ride.status}</span>
          <span className="text-sm font-black text-green-400">₹{ride.pricePerSeat}<span className="text-xs text-muted-foreground font-normal"> / seat</span></span>
        </div>

        {/* Route */}
        <div className="bg-secondary/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <div className="w-0.5 h-8 bg-border/80 my-1 rounded-full" />
              <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
            </div>
            <div className="space-y-5 flex-1 min-w-0">
              <div>
                <p className="text-[10px] font-black tracking-[0.15em] uppercase text-purple-400 mb-0.5">From</p>
                <p className="text-sm font-bold">{ride.from.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.15em] uppercase text-pink-400 mb-0.5">To</p>
                <p className="text-sm font-bold">{ride.to.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Calendar size={14} />, label: "Date", value: new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) },
            { icon: <Clock size={14} />, label: "Time", value: ride.time },
            { icon: <Users size={14} />, label: "Seats Available", value: `${ride.seats} seats` },
            { icon: <IndianRupee size={14} />, label: "Price / Seat", value: `₹${ride.pricePerSeat}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-secondary/20 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-1.5">{icon} {label}</div>
              <p className="text-xs font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {ride.description && (
          <div className="bg-secondary/20 p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-2"><FileText size={14} /> Notes</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{ride.description}</p>
          </div>
        )}

        {/* Meta */}
        <p className="text-[10px] text-muted-foreground/50 tracking-wider">Ride ID: {ride.id}</p>
      </div>
    </div>
  </div>
);

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
const CancelConfirmModal = ({ ride, onClose, onConfirm }: { ride: Ride; onClose: () => void; onConfirm: () => void }) => {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setCancelling(true);
    try {
      await rideApi.cancelRide(ride.id, reason);
      toast.success("Ride cancelled successfully");
      onConfirm();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to cancel ride");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-sm rounded-[2rem] border border-border/50 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h2 className="text-base font-black tracking-[0.15em] uppercase mb-2">Cancel Ride?</h2>
        <p className="text-sm text-muted-foreground mb-1 font-medium">{ride.from.name.split(",")[0]} → {ride.to.name.split(",")[0]}</p>
        <p className="text-xs text-muted-foreground/70 mb-5">This action cannot be undone. Passengers who booked this ride will be notified.</p>

        <div className="text-left mb-6">
          <label className="text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Reason for Cancellation</label>
          <textarea
            placeholder="Why are you cancelling?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-secondary/50 border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500/50 resize-none text-left placeholder:text-muted-foreground/50"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-border/50 rounded-full text-[11px] font-black tracking-[0.15em] uppercase hover:bg-secondary/50 transition-colors">Keep Ride</button>
          <button onClick={handleConfirm} disabled={cancelling} className="flex-1 py-3 bg-red-500 text-white rounded-full text-[11px] font-black tracking-[0.15em] uppercase hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {cancelling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle size={14} />}
            {cancelling ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyPostedRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"current" | "upcoming" | "past">("current");
  const [cancelRide, setCancelRide] = useState<Ride | null>(null);
  const [driverBookings, setDriverBookings] = useState<BookingResponse[]>([]);
  const [reviewRideBookings, setReviewRideBookings] = useState<BookingResponse[] | null>(null);

  useEffect(() => {
    fetchRides();
    fetchDriverBookings();
  }, []);

  const fetchDriverBookings = async () => {
    try {
      const res = await bookingApi.getDriverBookings();
      setDriverBookings(Array.from(res));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: "confirmed" | "rejected") => {
    try {
      await bookingApi.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      fetchDriverBookings();
      if (reviewRideBookings) {
        setReviewRideBookings(prev => prev?.map(b => b._id === bookingId ? { ...b, status } : b) || null);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update booking");
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await rideApi.getMyRides();
      const ridesArray = Array.isArray(res) ? (res as unknown as Ride[]) : [];
      setRides(ridesArray);
    } catch {
      toast.error("Failed to load your rides");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const getRideCategory = (r: Ride) => {
    const d = new Date(r.date); d.setHours(0, 0, 0, 0);
    if (r.status === "completed" || r.status === "cancelled" || d < today) return "past";
    if (d.getTime() === today.getTime() && r.status === "active") return "current";
    return "upcoming";
  };

  const filteredRides = rides.filter(r => getRideCategory(r) === filter);

  const handleRideCancelled = (id: string) => setRides(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" as const } : r));


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-6 pt-32 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>My Posted Rides</h1>
            <p className="text-sm text-muted-foreground mt-2 font-semibold">Manage all rides you have published</p>
          </div>
          <Link to="/post-ride" className="px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-xs rounded-full shadow-lg hover:brightness-110 transition-all whitespace-nowrap">
            Post New Ride
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-secondary/40 p-1.5 rounded-2xl w-max border border-border/40">
          {(["current", "upcoming", "past"] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${filter === tab ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Rides List */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredRides.length === 0 ? (
          <div className="text-center py-24 bg-card/50 rounded-[2rem] border border-border/40 shadow-inner">
            <MapPin size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-black tracking-widest uppercase mb-2">No {filter} rides</h3>
            <p className="text-sm text-muted-foreground font-medium">You don't have any {filter} rides to display.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRides.map(ride => {
              const rideBookings = driverBookings.filter(b => b.rideId === ride.id || (b.rideId as any)?._id === ride.id);
              const confirmedSeats = rideBookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + b.seatsBooked, 0);
              const pendingBookings = rideBookings.filter(b => b.status === "pending");

              return (
                <div key={ride.id} className="bg-card border border-border/40 rounded-[2rem] p-6 shadow-xl hover:border-border/80 transition-all">
                  <div className="flex flex-col md:flex-row gap-6">

                    {/* Route */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${ride.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : ride.status === "completed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>{ride.status}</span>
                        <span className="text-xs text-muted-foreground font-bold tracking-wider">₹{ride.pricePerSeat} / SEAT</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center mt-1.5">
                          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                          <div className="w-0.5 h-8 bg-border/80 my-1" />
                          <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.5)]" />
                        </div>
                        <div className="space-y-4 flex-1 min-w-0">
                          <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">From</p><p className="text-sm font-bold truncate">{ride.from.name.split(",")[0]}</p></div>
                          <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">To</p><p className="text-sm font-bold truncate">{ride.to.name.split(",")[0]}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-border/50 pt-5 md:pt-0 md:pl-6">
                      <div className="bg-secondary/20 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5"><Calendar size={12} /> Date</div><p className="text-xs font-bold">{new Date(ride.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                      <div className="bg-secondary/20 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5"><Clock size={12} /> Time</div><p className="text-xs font-bold">{ride.time}</p></div>
                      <div className="bg-secondary/20 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5"><Users size={12} /> Seats</div><p className="text-xs font-bold">{ride.seats - confirmedSeats} Available</p></div>
                      <div className="bg-secondary/20 p-3 rounded-2xl"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5"><CheckCircle size={12} /> Bookings</div><p className="text-xs font-bold text-primary">{confirmedSeats} Passengers</p></div>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-44 flex flex-col gap-2.5 border-t md:border-t-0 md:border-l border-border/50 pt-5 md:pt-0 md:pl-6 justify-center">
                      <button onClick={() => navigate(`/ride/${ride.id}`)} className="w-full py-2.5 bg-secondary hover:bg-secondary/80 border border-border/50 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-colors">
                        View Details
                      </button>
                      {filter !== "past" && ride.status === "active" && (
                        <>
                          <button onClick={() => navigate(`/ride/${ride.id}/edit`)} className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-1.5">
                            <Edit size={12} /> Edit Ride
                          </button>
                          <button onClick={() => setCancelRide(ride)} className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-1.5">
                            <XCircle size={12} /> Cancel
                          </button>
                        </>
                      )}
                      {pendingBookings.length > 0 && (
                        <button onClick={() => setReviewRideBookings(rideBookings)} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md animate-pulse">
                          Review {pendingBookings.length} Requests
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {cancelRide && (
        <CancelConfirmModal
          ride={cancelRide}
          onClose={() => setCancelRide(null)}
          onConfirm={() => handleRideCancelled(cancelRide.id)}
        />
      )}

      {/* Review Requests Modal */}
      {reviewRideBookings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-[2rem] border border-border/50 shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <h2 className="text-sm font-black tracking-[0.2em] uppercase">Manage Bookings</h2>
              <button onClick={() => setReviewRideBookings(null)} className="p-2 rounded-full hover:bg-secondary transition-colors"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-4 flex-1">
              {reviewRideBookings.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No bookings for this ride.</p>
              ) : (
                reviewRideBookings.map(b => (
                  <div key={b._id} className="bg-secondary/20 border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-black">
                          {b.passengerId.avatar || b.passengerId.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{b.passengerId.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{b.seatsBooked} Seat(s) • ₹{b.totalPrice}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${b.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                          b.status === "confirmed" ? "bg-green-500/20 text-green-500" :
                            "bg-red-500/20 text-red-500"
                        }`}>
                        {b.status}
                      </span>
                    </div>

                    {b.status === "pending" && (
                      <div className="flex gap-2 items-center sm:self-center">
                        <button onClick={() => handleUpdateBookingStatus(b._id, "confirmed")} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleUpdateBookingStatus(b._id, "rejected")} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-500/20 transition-colors">Reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostedRides;
