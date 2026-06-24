import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, ClipboardList, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { rideApi } from "../../../Endpoints/Api/ride/rideApi";
import type { Coordinate, Stopover } from "../../../types/ride/ride.types";

const STEPS = ["Route","Stopovers","Date","Time","Seats","Price","Booking"];

const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center gap-1.5 mb-8">
    {STEPS.map((s, i) => (
      <div key={s} className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-all ${i < current ? "bg-green-400" : i === current ? "bg-purple-500 scale-125" : "bg-border"}`} />
          <span className={`text-[9px] tracking-widest uppercase font-bold hidden md:block ${i === current ? "text-purple-400" : i < current ? "text-green-400" : "text-muted-foreground/40"}`}>{s}</span>
        </div>
        {i < STEPS.length - 1 && <div className={`w-3 h-px ${i < current ? "bg-green-400" : "bg-border"}`} />}
      </div>
    ))}
  </div>
);

type BookingType = "instant" | "review";

const InstantBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevState = (location.state as Record<string, unknown>) || {};

  const [bookingType, setBookingType] = useState<BookingType>("instant");
  const [submitting, setSubmitting] = useState(false);

  const selectedDate = prevState.date ? new Date(prevState.date as string) : null;
  const time = prevState.time as string | undefined;
  const seats = (prevState.seats as number) || 1;
  const price = (prevState.pricePerSeat as number) || 0;
  const stopovers = (prevState.stopovers as Array<{name:string}>) || [];

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const originCoord = prevState.originCoords as Coordinate | undefined;
      const destCoord = prevState.destCoords as Coordinate | undefined;

      if (!originCoord || !destCoord) {
        toast.error("Origin and destination coordinates are required.");
        return;
      }

      await rideApi.createRide({
        from: originCoord,
        to: destCoord,
        date: selectedDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        time: time || "09:00",
        seats,
        pricePerSeat: price,
        vehicleId: prevState.vehicleId as string | undefined,
        description: `Booking: ${bookingType === "instant" ? "Instant" : "Review required"}`,
        stopovers: (prevState.stopovers as Stopover[]) || [],
        distance: prevState.distance as string | undefined,
        duration: prevState.duration as string | undefined,
      });

      toast.success(`🎉 Ride published successfully!\n${(prevState.startingFrom as string)?.split(",")[0]} → ${(prevState.destination as string)?.split(",")[0]}`);
      navigate("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish ride.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };


  const options: { key: BookingType; icon: React.ReactNode; title: string; subtitle: string; badge?: string }[] = [
    {
      key: "instant",
      icon: <Zap size={24} className="text-yellow-400" />,
      title: "Enable Instant Booking",
      subtitle: "Passengers can book immediately without waiting for your approval.",
      badge: "Recommended",
    },
    {
      key: "review",
      icon: <ClipboardList size={24} className="text-blue-400" />,
      title: "Review Every Request",
      subtitle: "You review and approve each booking request before it expires.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-0 w-full z-50 pointer-events-none"><div className="pointer-events-auto"><Navbar /></div></div>

      {/* LEFT */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-14 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-6 transition-colors self-start">
          <ArrowLeft size={14} /> Back
        </button>

        <StepBar current={6} />

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
            <Zap size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Instant Booking</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose how passengers book your ride</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {options.map(opt => (
            <button key={opt.key} onClick={() => setBookingType(opt.key)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative ${bookingType === opt.key ? "border-purple-500 bg-purple-500/8 shadow-lg shadow-purple-500/10" : "border-border hover:border-purple-500/40 hover:bg-secondary/50"}`}>
              {opt.badge && (
                <span className="absolute top-4 right-4 text-[9px] tracking-widest uppercase font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                  {opt.badge}
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl transition-all ${bookingType === opt.key ? "bg-purple-500/20" : "bg-secondary"}`}>
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{opt.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-all ${bookingType === opt.key ? "border-purple-500 bg-purple-500" : "border-border"}`}>
                  {bookingType === opt.key && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleFinish} disabled={submitting}
          className="mt-10 w-full rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm tracking-widest uppercase font-bold py-4 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><CheckCircle2 size={16} /> Publish Ride</>}
        </button>
      </div>

      {/* RIGHT – Full Summary */}
      <div className="w-full lg:w-[48%] hidden lg:flex flex-col items-center justify-center p-12 pt-28">
        <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6 shadow-2xl space-y-4">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold mb-2">Complete Ride Summary</p>

          {/* Route */}
          <div className="space-y-2.5 pb-4 border-b border-border">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" /><p className="text-xs font-bold truncate">{(prevState.startingFrom as string)?.split(",")[0]}</p></div>
            {stopovers.map((s,i) => <div key={i} className="flex items-center gap-2 pl-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /><p className="text-xs text-muted-foreground truncate">{s.name.split(",")[0]}</p></div>)}
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" /><p className="text-xs font-bold truncate">{(prevState.destination as string)?.split(",")[0]}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!!prevState.distance && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Distance</p><p className="text-xs font-bold text-primary mt-0.5">{prevState.distance as string}</p></div>}
            {!!prevState.duration && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Duration</p><p className="text-xs font-bold text-primary mt-0.5">{prevState.duration as string}</p></div>}
            {selectedDate && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Date</p><p className="text-xs font-bold text-purple-300 mt-0.5">{selectedDate.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p></div>}
            {time && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Departure</p><p className="text-xs font-bold text-purple-300 mt-0.5">{formatTime(time)}</p></div>}
            <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Seats</p><p className="text-xs font-bold mt-0.5">{seats}</p></div>
            {stopovers.length > 0 && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Stopovers</p><p className="text-xs font-bold mt-0.5">{stopovers.length}</p></div>}
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Booking Mode</p>
            <div className="flex items-center gap-2 mt-1.5">
              {bookingType === "instant" ? <Zap size={14} className="text-yellow-400" /> : <ClipboardList size={14} className="text-blue-400" />}
              <p className="text-xs font-bold">{bookingType === "instant" ? "Instant Booking" : "Review Requests"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantBookingPage;
