import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, IndianRupee, Minus, Plus, ChevronRight, X } from "lucide-react";
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

const StopoverPriceModal = ({ isOpen, onClose, points, prices, setPrices, onContinue }: any) => {
  if (!isOpen) return null;

  const updatePrice = (index: number, delta: number) => {
    const newPrices = [...prices];
    newPrices[index] = Math.max(50, Math.min(1000, newPrices[index] + delta));
    setPrices(newPrices);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 pt-10 relative shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-black hover:bg-gray-100 p-2 rounded-full transition-colors">
          <X size={20} strokeWidth={3} />
        </button>
        
        <h2 className="text-[1.1rem] font-black tracking-widest uppercase text-center text-black mb-12 px-4" style={{ fontFamily: "var(--font-heading)" }}>
          EDIT YOUR RECOMMENDED PRICE PER SEAT
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
          <div className="relative pl-2">
            {/* Continuous line */}
            <div className="absolute left-[15px] top-2 bottom-6 w-1.5 bg-black rounded-full z-0" />
            
            {points.map((point: any, i: number) => (
              <div key={i} className="relative z-10 flex items-start mb-24 last:mb-0">
                {/* Dot */}
                <div className="w-4 h-4 rounded-full bg-[#e5e5e5] shrink-0 mt-0.5 mr-6 relative z-10" />
                
                {/* Text */}
                <div className="flex-1">
                  <p className="text-[13px] font-black tracking-[0.15em] uppercase text-black">{point.name.split(',')[0]}</p>
                  {point.name.includes(',') && (
                    <p className="text-[11px] text-[#a0a0a0] font-bold mt-1 pr-4 leading-snug max-w-[65%]">
                      {point.name.split(',').slice(1).join(',').trim()}
                    </p>
                  )}
                </div>

                {/* Price Control */}
                {i < points.length - 1 && (
                  <div className="absolute right-0 top-[60px] flex items-center gap-3 bg-white pl-4 z-20">
                    <button onClick={() => updatePrice(i, -10)} className="w-10 h-10 rounded-full border-[2px] border-black flex items-center justify-center hover:bg-gray-100 text-black transition-colors shrink-0">
                      <Minus size={20} strokeWidth={2.5} />
                    </button>
                    <div className="w-[85px] text-center font-black text-3xl text-[#00b300] tracking-tighter shrink-0">
                      ₹{prices[i]}
                    </div>
                    <button onClick={() => updatePrice(i, 10)} className="w-10 h-10 rounded-full border-[2px] border-black flex items-center justify-center hover:bg-gray-100 text-black transition-colors shrink-0">
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onContinue} className="mt-10 w-[85%] mx-auto py-4 bg-[#1a1a1a] text-white rounded-full font-black tracking-[0.2em] uppercase text-xs hover:bg-black transition-colors shadow-xl">
          CONTINUE
        </button>
      </div>
    </div>
  );
};

const PriceSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevState = (location.state as Record<string, unknown>) || {};

  const [price, setPrice] = useState(150);
  const recommendedMin = 140;
  const recommendedMax = 160;

  const handleContinue = () => {
    navigate("/ride-booking", { state: { ...prevState, pricePerSeat: price } });
  };

  const selectedDate = prevState.date ? new Date(prevState.date as string) : null;
  const time = prevState.time as string | undefined;
  const seats = (prevState.seats as number) || 1;
  const stopovers = (prevState.stopovers as Array<{name:string}>) || [];
  
  const points = [
    { name: (prevState.startingFrom as string) || "Origin" },
    ...stopovers.map(s => ({ name: s.name })),
    { name: (prevState.destination as string) || "Destination" }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [segmentPrices, setSegmentPrices] = useState<number[]>(Array(points.length - 1).fill(150));

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

        <StepBar current={5} />

        <div className="flex flex-col items-center w-full max-w-md mx-auto bg-[#0a0a0a] rounded-3xl p-8 border border-border/20 shadow-2xl relative overflow-hidden mt-4">
          {/* Subtle background waves just for the card to match screenshot */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 400 400" fill="none" preserveAspectRatio="none">
               {[...Array(8)].map((_, i) => (
                 <path key={i} d={`M0 ${100 + i * 15} Q200 ${50 + i * 25 + Math.sin(i) * 20} 400 ${100 + i * 10} T800 ${90 + i * 15}`} stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity={0.4 - i * 0.04} />
               ))}
             </svg>
          </div>

          <h2 className="text-xl font-bold tracking-widest uppercase mb-10 text-foreground z-10 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            SET YOUR PRICE PER SEAT
          </h2>

          <div className="flex items-center justify-center gap-8 mb-8 z-10 w-full">
            <button onClick={() => setPrice(p => Math.max(50, p - 10))}
              className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-black/60 transition-all text-white shadow-lg shrink-0">
              <Minus size={20} />
            </button>
            
            <div className="text-[3.5rem] font-black text-green-500 tracking-tighter shrink-0 flex items-center">
              <span className="text-4xl mr-1">₹</span>{price}
            </div>
            
            <button onClick={() => setPrice(p => Math.min(1000, p + 10))}
              className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-black/60 transition-all text-white shadow-lg shrink-0">
              <Plus size={20} />
            </button>
          </div>

          <div className="w-full text-left mb-6 z-10">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
              Recommended price: ₹{recommendedMin} - ₹{recommendedMax}
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">
              Perfect price for this ride! You'll get passengers in no time
            </p>
          </div>

          <div className="w-full h-1 bg-secondary/50 rounded-full mb-6 z-10" />

          <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-between z-10 group mb-8">
            <div className="text-left">
              <p className="text-sm font-bold tracking-widest uppercase text-foreground">STOPOVER PRICES</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">stop wise prices that u can edit</p>
            </div>
            <ChevronRight size={20} className="text-foreground group-hover:translate-x-1 transition-transform" />
          </button>

          <button onClick={handleContinue}
            className="w-full rounded-[2rem] bg-white text-black text-sm tracking-[0.2em] uppercase font-black py-4 hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10">
            CONTINUE
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[48%] hidden lg:flex flex-col items-center justify-center p-12 pt-28 gap-8">
        <div className="w-full max-w-sm rounded-3xl bg-card border border-border/40 p-6 shadow-2xl space-y-3">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold">Your Ride</p>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /><p className="text-xs font-bold truncate">{(prevState.startingFrom as string)?.split(",")[0]}</p></div>
          {stopovers.map((s,i) => (
            <div key={i} className="flex items-center gap-2 pl-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /><p className="text-xs text-muted-foreground truncate">{s.name.split(",")[0]}</p></div>
          ))}
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /><p className="text-xs font-bold truncate">{(prevState.destination as string)?.split(",")[0]}</p></div>
          {selectedDate && <div className="pt-3 border-t border-border"><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Date</p><p className="text-xs font-bold text-purple-300 mt-0.5">{selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p></div>}
          {time && <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Time</p><p className="text-xs font-bold text-purple-300 mt-0.5">{formatTime(time)}</p></div>}
          <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Seats Offered</p><p className="text-xs font-bold mt-0.5">{seats} seats</p></div>
          
          <div className="pt-3 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Price Per Seat</p>
            <p className="text-2xl font-black text-green-400 mt-1">₹{price} <span className="text-sm font-normal text-muted-foreground">/ seat</span></p>
          </div>
        </div>
        <div className="text-center">
          <IndianRupee size={80} className="text-green-500/10 mx-auto" />
          <p className="text-xs text-muted-foreground/40 tracking-widest uppercase mt-2">Step 6 of 7</p>
        </div>
      </div>

      <StopoverPriceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        points={points}
        prices={segmentPrices}
        setPrices={setSegmentPrices}
        onContinue={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PriceSelectionPage;
