import React, { useState } from "react";
import { X, Users, IndianRupee, Loader2 } from "lucide-react";
import type { Ride } from "../../../types/ride/ride.types";
import { bookingApi } from "../../../Endpoints/Api/booking/bookingApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface BookSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}

const BookSeatModal: React.FC<BookSeatModalProps> = ({ isOpen, onClose, ride }) => {
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const maxSeats = ride.seats || 1; // Assuming ride.seats is available seats. In a real app we'd fetch confirmed seats count.

  const handleBook = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.createBooking({
        rideId: ride.id || (ride as any)._id,
        seatsToBook,
      });

      // The Axios interceptor spreads object responses directly onto the return value.
      // So res.status is the booking status, not an HTTP status code.
      if (res.status === "confirmed") {
        toast.success("Booking confirmed! You're all set.");
      } else {
        toast.info("Booking request sent. Waiting for driver approval.");
      }
      onClose();
      navigate("/my-bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book seats");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = seatsToBook * ride.pricePerSeat;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider">Book Seats</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                {ride.from.name.split(",")[0]} → {ride.to.name.split(",")[0]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1.5 mb-3">
                <Users size={12} /> Number of Seats
              </label>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {[...Array(Math.min(maxSeats, 8))].map((_, i) => {
                    const seatNum = i + 1;
                    return (
                      <button
                        key={seatNum}
                        onClick={() => setSeatsToBook(seatNum)}
                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                          seatsToBook === seatNum
                            ? "bg-foreground text-background shadow-md scale-110"
                            : "bg-background text-foreground border border-border hover:border-foreground/50"
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1.5 mb-2">
                <IndianRupee size={12} /> Fare Summary
              </label>
              <div className="flex justify-between items-center text-sm font-bold text-muted-foreground mb-2">
                <span>{seatsToBook} × ₹{ride.pricePerSeat}</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="h-px w-full bg-border/50 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Total</span>
                <span className="text-xl font-black text-foreground">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 font-black text-xs tracking-widest uppercase rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
            <p className="text-center text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-4">
              {(ride as any).bookingMode === "review" ? "Requires driver approval" : "Instant Confirmation"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSeatModal;
