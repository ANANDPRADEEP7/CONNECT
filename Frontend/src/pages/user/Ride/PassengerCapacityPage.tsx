import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Minus, Plus, Car } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { Button } from "../../../components/ui/button";
import { vehicleApi } from "../../../Endpoints/Api/vehicle/vehicleApi";
import {type Vehicle } from "../../../types/vehicle/vehicle.types";

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

// Dynamic vehicle seat diagram
const SeatDiagram = ({ seats, type }: { seats: number; type?: string }) => {
  const filled = (n: number) => n <= seats;
  const seatStyle = (active: boolean) =>
    `w-8 h-10 rounded-t-xl rounded-b-sm border-2 transition-all ${
      active
        ? "border-purple-500 bg-purple-500/20 shadow-[0_0_10px_#a855f7]"
        : "border-border bg-secondary/40"
    }`;

  if (type === "SUV" || type === "Van") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">SUV / Van Layout</p>
        {/* Row 1 */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <div className={seatStyle(true)} />
            <span className="text-[8px] text-muted-foreground uppercase font-semibold">Driver</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={seatStyle(filled(1))} />
            <span className="text-[8px] text-muted-foreground uppercase font-semibold">Seat 1</span>
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            {[2, 3, 4].map(n => (
              <div key={n} className={seatStyle(filled(n))} />
            ))}
          </div>
          <span className="text-[8px] text-muted-foreground uppercase font-semibold mt-0.5">Middle Row</span>
        </div>
        {/* Row 3 */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            {[5, 6, 7].map(n => (
              <div key={n} className={seatStyle(filled(n))} />
            ))}
          </div>
          <span className="text-[8px] text-muted-foreground uppercase font-semibold mt-0.5">Back Row</span>
        </div>
      </div>
    );
  }

  // Standard Car layout
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Standard Layout</p>
      {/* Row 1 */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <div className={seatStyle(true)} />
          <span className="text-[8px] text-muted-foreground uppercase font-semibold">Driver</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className={seatStyle(filled(1))} />
          <span className="text-[8px] text-muted-foreground uppercase font-semibold">Seat 1</span>
        </div>
      </div>
      {/* Row 2 */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          {[2, 3, 4].map(n => (
            <div key={n} className={seatStyle(filled(n))} />
          ))}
        </div>
        <span className="text-[8px] text-muted-foreground uppercase font-semibold mt-0.5">Back Row</span>
      </div>
    </div>
  );
};

const PassengerCapacityPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevState = (location.state as Record<string, unknown>) || {};

  const [seats, setSeats] = useState(2);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await vehicleApi.getMyVehicles();
        const list = Array.isArray(res) ? (res as unknown as Vehicle[]) : [];
        setVehicles(list);
        const defaultVeh = list.find((v) => v.isDefault) || list[0] || null;
        setSelectedVehicle(defaultVeh);
        if (defaultVeh) {
          setSeats(Math.min(defaultVeh.seats, 4));
        }
      } catch {
        toast.error("Failed to load registered vehicles");
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, []);

  const maxSeats = selectedVehicle ? selectedVehicle.seats : 4;

  const handleContinue = () => {
    if (!selectedVehicle) {
      toast.error("Please register and select a vehicle to post this ride.");
      return;
    }
    navigate("/ride-price", { state: { ...prevState, seats, vehicleId: selectedVehicle.id } });
  };

  const selectedDate = prevState.date ? new Date(prevState.date as string) : null;
  const time = prevState.time as string | undefined;
  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-0 w-full z-50 pointer-events-none"><div className="pointer-events-auto"><Navbar /></div></div>

      {/* LEFT */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-14 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-6 transition-colors self-start">
          <ArrowLeft size={14} /> Back
        </button>

        <StepBar current={4} />

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <Users size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Passengers</h2>
            <p className="text-xs text-muted-foreground mt-0.5">How many seats can you offer?</p>
          </div>
        </div>

        {/* Vehicle Selection Section */}
        <div className="mb-6 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1 flex items-center gap-1.5">
            <Car size={12} /> Select Vehicle
          </p>
          {loadingVehicles ? (
            <div className="py-4 text-xs text-muted-foreground">Loading your vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="p-5 rounded-2xl border-2 border-dashed border-border/60 bg-red-500/5 text-center space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                You must register at least one vehicle in your profile to publish a ride.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                size="sm"
                className="text-[10px] tracking-wider uppercase font-black px-4 border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                Go to Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicle(v);
                    setSeats(Math.min(v.seats, seats));
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                    selectedVehicle?.id === v.id
                      ? "border-purple-500 bg-purple-500/10 shadow-[0_0_12px_rgba(var(--primary),0.05)]"
                      : "border-border/60 hover:border-purple-500/40 bg-secondary/30"
                  }`}
                >
                  <div className="p-2 bg-background rounded-xl border border-border/40 shrink-0">
                    <Car size={16} className={selectedVehicle?.id === v.id ? "text-purple-400" : "text-muted-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{v.name}</p>
                    <p className="text-[9px] text-muted-foreground tracking-wider uppercase mt-0.5 truncate">
                      {v.model} • {v.seats} seats
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Seat counter */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-2xl border border-border/40 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Available Seats</p>
            <p className="text-xs text-muted-foreground mt-1">Max {maxSeats} for passengers</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setSeats(s => Math.max(1, s - 1))}
              className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition-all">
              <Minus size={16} />
            </button>
            <span className="text-4xl font-black w-10 text-center text-foreground">{seats}</span>
            <button onClick={() => setSeats(s => Math.min(maxSeats, s + 1))}
              className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Seat diagram */}
        <div className="mt-6 rounded-2xl border border-border/40 bg-secondary/30">
          <SeatDiagram seats={seats} type={selectedVehicle?.type} />
        </div>

        <button onClick={handleContinue}
          className="mt-8 w-full rounded-full bg-primary text-primary-foreground text-sm tracking-widest uppercase font-bold py-4 hover:brightness-110 transition-all shadow-lg">
          Continue
        </button>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[48%] hidden lg:flex flex-col items-center justify-center p-12 pt-28 gap-8">
        <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6 shadow-2xl space-y-3">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold">Your Ride</p>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /><p className="text-xs font-bold truncate">{(prevState.startingFrom as string)?.split(",")[0]}</p></div>
          {((prevState.stopovers as Array<{name:string}>) || []).map((s,i) => (
            <div key={i} className="flex items-center gap-2 pl-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /><p className="text-xs text-muted-foreground truncate">{s.name.split(",")[0]}</p></div>
          ))}
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /><p className="text-xs font-bold truncate">{(prevState.destination as string)?.split(",")[0]}</p></div>
          {selectedDate && <div className="pt-3 border-t border-border"><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Date</p><p className="text-xs font-bold text-purple-300 mt-0.5">{selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p></div>}
          {time && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Time</p><p className="text-xs font-bold text-purple-300 mt-0.5">{formatTime(time)}</p></div>}
          <div className="pt-3 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Seats Offered</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{seats} <span className="text-sm font-normal text-muted-foreground">seats</span></p>
          </div>
        </div>
        <div className="text-center">
          <Users size={80} className="text-purple-500/10 mx-auto" />
          <p className="text-xs text-muted-foreground/40 tracking-widest uppercase mt-2">Step 5 of 7</p>
        </div>
      </div>
    </div>
  );
};

export default PassengerCapacityPage;
