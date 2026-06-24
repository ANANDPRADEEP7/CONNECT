import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { bookingApi,type BookingResponse } from "../../../Endpoints/Api/booking/bookingApi";
import { Loader2, Navigation, IndianRupee, Clock, Calendar, Car, ArrowRight } from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      // The Axios interceptor spreads array responses directly onto the return value,
      // so `res` IS the array (with statusCode/message attached). No `.data` wrapper.
      setBookings(Array.from(res));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.updateBookingStatus(bookingId, "cancelled");
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const now = new Date();
  
  const upcomingBookings = bookings.filter((b) => {
    if (b.status === "cancelled" || b.status === "rejected") return false;
    if (!b.rideId) return false;
    const rideDate = new Date(`${b.rideId.date}T${b.rideId.time}`);
    return rideDate >= now;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.status === "cancelled" || b.status === "rejected") return true;
    if (!b.rideId) return true;
    const rideDate = new Date(`${b.rideId.date}T${b.rideId.time}`);
    return rideDate < now;
  });

  const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-6">
          My Bookings
        </h1>

        <div className="flex gap-4 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 text-xs font-black tracking-widest uppercase transition-all ${
              activeTab === "upcoming"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            Upcoming / Pending ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 text-xs font-black tracking-widest uppercase transition-all ${
              activeTab === "past"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            Past / Cancelled ({pastBookings.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-3xl bg-secondary/20">
            <Navigation size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-black tracking-widest uppercase text-foreground">No Bookings Found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              You don't have any {activeTab} bookings yet. Start searching for rides to book a seat!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedBookings.map((booking) => {
              const ride = booking.rideId;
              if (!ride) return null;

              const isCancelable = booking.status === "pending" || booking.status === "confirmed";
              
              const statusColors = {
                pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
                cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
                rejected: "bg-red-500/10 text-red-500 border-red-500/20",
              };

              return (
                <div key={booking._id} className="bg-card border border-border/60 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">From</p>
                        <p className="text-sm font-extrabold truncate">{ride.from?.name?.split(",")[0]}</p>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground/50 shrink-0" />
                      <div className="flex-1 text-right">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">To</p>
                        <p className="text-sm font-extrabold truncate">{ride.to?.name?.split(",")[0]}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                        <Calendar size={12} className="text-muted-foreground mb-1.5" />
                        <p className="text-[10px] font-bold text-foreground truncate">{new Date(ride.date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                        <Clock size={12} className="text-muted-foreground mb-1.5" />
                        <p className="text-[10px] font-bold text-foreground truncate">{ride.time}</p>
                      </div>
                      <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                        <Car size={12} className="text-muted-foreground mb-1.5" />
                        <p className="text-[10px] font-bold text-foreground truncate">{booking.seatsBooked} Seats</p>
                      </div>
                      <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                        <IndianRupee size={12} className="text-muted-foreground mb-1.5" />
                        <p className="text-[10px] font-bold text-foreground truncate">₹{booking.totalPrice}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/50 pt-5 md:pt-0 md:pl-6">
                    {booking.driverId && (
                      <div className="mb-4">
                        <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-black mb-2">Driver Details</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-black">
                            {booking.driverId.avatar || booking.driverId.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{booking.driverId.name}</p>
                            {booking.driverId.phonenumber && booking.status === "confirmed" && (
                              <p className="text-[10px] font-medium text-muted-foreground">{booking.driverId.phonenumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isCancelable && activeTab === "upcoming" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black text-[10px] tracking-widest uppercase rounded-xl transition-all border border-red-500/20"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
