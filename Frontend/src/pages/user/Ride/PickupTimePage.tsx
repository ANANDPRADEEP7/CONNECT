import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, ChevronUp, ChevronDown } from "lucide-react";
import Navbar from "../../../components1/common/Navbar/Navbar";

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

const DrumColumn = ({
  label, value, onUp, onDown, display,
}: { label: string; value: string; onUp: () => void; onDown: () => void; display?: string; }) => (
  <div className="flex flex-col items-center gap-3">
    <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-bold">{label}</p>
    <button onClick={onUp} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-purple-400">
      <ChevronUp size={20} />
    </button>
    <div className="w-20 h-16 flex items-center justify-center rounded-2xl border-2 border-purple-500/30 bg-purple-500/5">
      <span className="text-3xl font-black text-foreground tracking-tight">{display || value}</span>
    </div>
    <button onClick={onDown} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-purple-400">
      <ChevronDown size={20} />
    </button>
  </div>
);

const PickupTimePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevState = (location.state as Record<string, unknown>) || {};

  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  const cycleHour = (dir: 1 | -1) => setHour(h => ((h - 1 + dir + 12) % 12) + 1);
  const cycleMinute = (dir: 1 | -1) => setMinute(m => (m + dir * 5 + 60) % 60);
  const toggleAmpm = () => setAmpm(a => a === "AM" ? "PM" : "AM");

  const timeString = () => {
    const h24 = ampm === "AM" ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    return `${String(h24).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
  };

  const displayTime = `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${ampm}`;

  const handleContinue = () => {
    navigate("/ride-capacity", { state: { ...prevState, time: timeString() } });
  };

  const selectedDate = prevState.date ? new Date(prevState.date as string) : null;

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-0 w-full z-50 pointer-events-none"><div className="pointer-events-auto"><Navbar /></div></div>

      {/* LEFT */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-14 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-6 transition-colors self-start">
          <ArrowLeft size={14} /> Back
        </button>

        <StepBar current={3} />

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <Clock size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Pick-up Time</h2>
            <p className="text-xs text-muted-foreground mt-0.5">When will you depart?</p>
          </div>
        </div>

        {/* Time display */}
        <div className="mt-6 px-6 py-5 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/5 border border-purple-500/20 text-center">
          <p className="text-4xl font-black tracking-tight text-foreground">{displayTime}</p>
          {selectedDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </p>
          )}
        </div>

        {/* Drum Picker */}
        <div className="mt-8 flex items-center justify-center gap-8 py-8 rounded-2xl border border-border/40 bg-secondary/30">
          <DrumColumn label="Hour" value={String(hour)} display={String(hour).padStart(2,"0")} onUp={() => cycleHour(1)} onDown={() => cycleHour(-1)} />

          <div className="text-3xl font-black text-muted-foreground/40 self-center pb-2">:</div>

          <DrumColumn label="Minute" value={String(minute)} display={String(minute).padStart(2,"0")} onUp={() => cycleMinute(1)} onDown={() => cycleMinute(-1)} />

          {/* AM/PM */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-bold">Period</p>
            <button onClick={toggleAmpm} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-purple-400">
              <ChevronUp size={20} />
            </button>
            <div className="w-20 h-16 flex items-center justify-center rounded-2xl border-2 border-purple-500/30 bg-purple-500/5 cursor-pointer" onClick={toggleAmpm}>
              <span className="text-2xl font-black text-purple-400">{ampm}</span>
            </div>
            <button onClick={toggleAmpm} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-purple-400">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        <button onClick={handleContinue}
          className="mt-8 w-full rounded-full bg-primary text-primary-foreground text-sm tracking-widest uppercase font-bold py-4 hover:brightness-110 transition-all shadow-lg">
          Continue
        </button>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[48%] hidden lg:flex flex-col items-center justify-center p-12 pt-28 gap-8">
        <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6 shadow-2xl space-y-4">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold">Your Ride</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <p className="text-xs font-bold truncate">{(prevState.startingFrom as string)?.split(",")[0]}</p>
          </div>
          {((prevState.stopovers as Array<{name:string}>) || []).map((s,i) => (
            <div key={i} className="flex items-center gap-2 pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <p className="text-xs text-muted-foreground truncate">{s.name.split(",")[0]}</p>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <p className="text-xs font-bold truncate">{(prevState.destination as string)?.split(",")[0]}</p>
          </div>
          {selectedDate && (
            <div className="pt-3 border-t border-border">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Date</p>
              <p className="text-xs font-bold text-purple-300 mt-0.5">{selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
            </div>
          )}
          <div className="pt-3 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Departure Time</p>
            <p className="text-sm font-black text-purple-300 mt-0.5">{displayTime}</p>
          </div>
        </div>
        <div className="text-center">
          <Clock size={80} className="text-purple-500/10 mx-auto" />
          <p className="text-xs text-muted-foreground/40 tracking-widest uppercase mt-2">Step 4 of 7</p>
        </div>
      </div>
    </div>
  );
};

export default PickupTimePage;
