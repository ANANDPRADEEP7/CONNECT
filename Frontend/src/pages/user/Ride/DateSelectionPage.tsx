import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, MapPin } from "lucide-react";
import Navbar from "../../../components1/common/Navbar/Navbar";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
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

const DateSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevState = (location.state as Record<string, unknown>) || {};

  const today = new Date(); today.setHours(0,0,0,0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const yr = viewMonth.getFullYear();
  const mo = viewMonth.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(yr, mo, d));
    return arr;
  }, [yr, mo, firstDay, daysInMonth]);

  const isPast = (d: Date) => d < today;
  const isSelected = (d: Date) => selectedDate?.toDateString() === d.toDateString();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();

  const handleContinue = () => {
    if (!selectedDate) return;
    navigate("/ride-time", { state: { ...prevState, date: selectedDate.toISOString() } });
  };

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-0 w-full z-50 pointer-events-none"><div className="pointer-events-auto"><Navbar /></div></div>

      {/* LEFT */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 md:px-14 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-6 transition-colors self-start">
          <ArrowLeft size={14} /> Back
        </button>

        <StepBar current={2} />

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <Calendar size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>When Are You Going?</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select your departure date</p>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-5 px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
            <Calendar size={16} className="text-purple-400 shrink-0" />
            <p className="text-sm font-bold text-purple-300 tracking-wide">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        )}

        {/* Calendar */}
        <div className="mt-6 rounded-2xl border border-border/40 bg-secondary/40 p-5">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setViewMonth(new Date(yr, mo - 1, 1))} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold tracking-widest uppercase">{MONTHS[mo]} {yr}</span>
            <button onClick={() => setViewMonth(new Date(yr, mo + 1, 1))} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold tracking-widest uppercase text-muted-foreground py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, idx) => {
              if (!date) return <div key={idx} />;
              const past = isPast(date);
              const sel = isSelected(date);
              const tod = isToday(date);
              return (
                <button key={idx} disabled={past} onClick={() => setSelectedDate(date)}
                  className={`relative aspect-square flex items-center justify-center text-xs font-semibold rounded-xl transition-all
                    ${past ? "text-muted-foreground/20 cursor-not-allowed" : ""}
                    ${sel ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40" : ""}
                    ${!sel && !past ? "hover:bg-accent text-foreground" : ""}
                    ${tod && !sel ? "border border-purple-500/50 text-purple-300" : ""}
                  `}>
                  {date.getDate()}
                  {tod && !sel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleContinue} disabled={!selectedDate}
          className="mt-8 w-full rounded-full bg-primary text-primary-foreground text-sm tracking-widest uppercase font-bold py-4 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg">
          Continue
        </button>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[48%] hidden lg:flex flex-col items-center justify-center p-12 pt-28 gap-8">
        <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6 shadow-2xl">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold mb-4">Your Ride</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">From</p>
                <p className="text-xs font-bold text-foreground">{(prevState.startingFrom as string)?.split(",")[0] || "Origin"}</p>
              </div>
            </div>
            {((prevState.stopovers as Array<{name:string}>) || []).map((s, i) => (
              <div key={i} className="flex items-start gap-3 pl-1">
                <div className="w-2 h-2 mt-1 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0" />
                <p className="text-xs text-muted-foreground">{s.name.split(",")[0]}</p>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">To</p>
                <p className="text-xs font-bold text-foreground">{(prevState.destination as string)?.split(",")[0] || "Destination"}</p>
              </div>
            </div>
          </div>
          
          {!!(prevState.distance || prevState.duration) && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
              <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Distance</p><p className="text-xs font-bold text-primary">{prevState.distance as string}</p></div>
              <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Duration</p><p className="text-xs font-bold text-primary">{prevState.duration as string}</p></div>
            </div>
          )}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Date</p>
              <p className="text-xs font-bold text-purple-300 mt-0.5">{selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <MapPin size={80} className="text-purple-500/10 mx-auto" />
          <p className="text-xs text-muted-foreground/40 tracking-widest uppercase mt-2">Step 3 of 7</p>
        </div>
      </div>
    </div>
  );
};

export default DateSelectionPage;
