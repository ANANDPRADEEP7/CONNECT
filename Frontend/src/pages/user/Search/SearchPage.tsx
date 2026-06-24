import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Clock, SlidersHorizontal, Star, Car, Compass, ArrowRightLeft } from "lucide-react";
import Navbar from "../../../components1/common/Navbar/Navbar";
import Footer from "../../../components1/user/Home/Footer";
import { toast } from "react-toastify";
import { rideApi } from "../../../Endpoints/Api/ride/rideApi";
import type { SearchRide } from "../../../types/ride/ride.types";

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  // Handle formats like "07:30 AM" or "09:00 PM"
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) {
    // Check if it's 24h format "HH:MM"
    const match24 = timeStr.trim().match(/^(\d+):(\d+)$/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const m = parseInt(match24[2], 10);
      return h * 60 + m;
    }
    return 0;
  }
  let [_, hoursStr, minutesStr, ampm] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (ampm.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  } else if (ampm.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search parameters state
  const fromQuery = searchParams.get("from") || "";
  const toQuery = searchParams.get("to") || "";
  const dateQuery = searchParams.get("date") || "";
  const passengersQuery = searchParams.get("passengers") || "1";

  // Form input states
  const [fromInput, setFromInput] = useState(fromQuery);
  const [toInput, setToInput] = useState(toQuery);
  const [dateInput, setDateInput] = useState(dateQuery);
  const [passengersInput, setPassengersInput] = useState(passengersQuery);

  // Real ride results, loading, and error states
  const [rides, setRides] = useState<SearchRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<"price" | "time" | "seats">("price");

  // Filters State
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<{
    earlyMorning: boolean; // Before 6 AM
    morning: boolean;      // 6 AM - 12 PM
    afternoon: boolean;    // 12 PM - 6 PM
    evening: boolean;      // After 6 PM
  }>({
    earlyMorning: false,
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedStopovers, setSelectedStopovers] = useState<string[]>([]);

  // Find highest price in search results
  const highestPrice = useMemo(() => {
    return rides.reduce((max, r) => r.pricePerSeat > max ? r.pricePerSeat : max, 0);
  }, [rides]);

  // Extract all unique stopovers from search results to render as filter checkboxes
  const availableStopovers = useMemo(() => {
    const names = new Set<string>();
    rides.forEach((r) => {
      r.stopovers?.forEach((s) => {
        if (s.name) names.add(s.name.trim());
      });
    });
    return Array.from(names).sort();
  }, [rides]);

  // Reset filters on fresh search queries
  useEffect(() => {
    setMaxPrice(null);
    setSelectedTimeOfDay({
      earlyMorning: false,
      morning: false,
      afternoon: false,
      evening: false,
    });
    setDirectOnly(false);
    setSelectedStopovers([]);
  }, [fromQuery, toQuery, dateQuery, passengersQuery]);

  // Keep form inputs synced with URL search params changes (e.g. going back/forward)
  useEffect(() => {
    setFromInput(fromQuery);
    setToInput(toQuery);
    setDateInput(dateQuery);
    setPassengersInput(passengersQuery);
  }, [fromQuery, toQuery, dateQuery, passengersQuery]);

  // Fetch search results from backend
  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await rideApi.searchRides({
          from: fromQuery.trim() || undefined,
          to: toQuery.trim() || undefined,
          date: dateQuery || undefined,
          seats: passengersQuery ? Number(passengersQuery) : undefined,
        });

        // Cast to any to bypass TypeScript narrowing which causes the 'never' type error
        const res = response as any;
        
        if (Array.isArray(res)) {
          setRides(res);
        } else if (res.statusCode === 200 && res.data) {
          setRides(res.data);
        } else {
          const msg = res.message || "Failed to search rides";
          setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || "An error occurred while searching rides";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [fromQuery, toQuery, dateQuery, passengersQuery]);

  // Handle Form Submission / Refresh Search Params
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      from: fromInput,
      to: toInput,
      date: dateInput,
      passengers: passengersInput,
    });
  };

  const swapLocations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    setSearchParams({
      from: toInput,
      to: temp,
      date: dateInput,
      passengers: passengersInput,
    });
  };

  // Sort and filter matched rides based on filter options
  const sortedRides = useMemo(() => {
    let result = [...rides];

    // 1. Apply Price Filter
    if (maxPrice !== null) {
      result = result.filter((r) => r.pricePerSeat <= maxPrice);
    }

    // 2. Apply Time of Day Filter
    const hasTimeFilter = Object.values(selectedTimeOfDay).some((v) => v);
    if (hasTimeFilter) {
      result = result.filter((r) => {
        const minutes = parseTimeToMinutes(r.time);
        if (selectedTimeOfDay.earlyMorning && minutes < 360) return true; // Before 6:00 AM
        if (selectedTimeOfDay.morning && minutes >= 360 && minutes < 720) return true; // 6:00 AM - 12:00 PM
        if (selectedTimeOfDay.afternoon && minutes >= 720 && minutes < 1080) return true; // 12:00 PM - 6:00 PM
        if (selectedTimeOfDay.evening && minutes >= 1080) return true; // After 6:00 PM
        return false;
      });
    }

    // 3. Apply Location/Stopover Filter
    if (directOnly) {
      result = result.filter((r) => !r.stopovers || r.stopovers.length === 0);
    }
    if (selectedStopovers.length > 0) {
      result = result.filter((r) =>
        r.stopovers && r.stopovers.some((s) => selectedStopovers.includes(s.name.trim())),
      );
    }

    // 4. Sorting logic
    if (sortBy === "price") {
      result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    } else if (sortBy === "time") {
      result.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    } else if (sortBy === "seats") {
      result.sort((a, b) => b.seats - a.seats);
    }

    return result;
  }, [rides, sortBy, maxPrice, selectedTimeOfDay, directOnly, selectedStopovers]);

  const handleBook = (ride: SearchRide) => {
    toast.success(`Booking request sent to ${ride.driver.name} for ride to ${ride.to.name}!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Main Search Panel Wrapper */}
      <div className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Search header bar */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase mb-3 text-foreground">
            Find Your Next Ride
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wider">
            Connect with verified drivers going your way
          </p>
        </div>

        {/* Floating Glassmorphism Search Panel */}
        <form onSubmit={handleSearchSubmit} className="bg-card border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-2xl mb-12 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-foreground" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* From Input */}
            <div className="md:col-span-3 flex items-center gap-3 bg-secondary/40 border border-border/20 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-foreground" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-black tracking-[0.25em] text-muted-foreground uppercase mb-0.5">Leaving From</label>
                <input
                  type="text"
                  placeholder="E.g. Bangalore"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={swapLocations}
                className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border/40 hover:border-border/80 transition-all hover:scale-105"
                title="Swap Locations"
              >
                <ArrowRightLeft size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* To Input */}
            <div className="md:col-span-3 flex items-center gap-3 bg-secondary/40 border border-border/20 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-colors">
              <MapPin size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-black tracking-[0.25em] text-muted-foreground uppercase mb-0.5">Going To</label>
                <input
                  type="text"
                  placeholder="E.g. Chennai"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Date Input */}
            <div className="md:col-span-2 flex items-center gap-3 bg-secondary/40 border border-border/20 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-colors">
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-black tracking-[0.25em] text-muted-foreground uppercase mb-0.5">Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs font-bold text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Passengers Input */}
            <div className="md:col-span-1.5 flex items-center gap-3 bg-secondary/40 border border-border/20 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-colors">
              <Users size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-black tracking-[0.25em] text-muted-foreground uppercase mb-0.5">Seats</label>
                <select
                  value={passengersInput}
                  onChange={(e) => setPassengersInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs font-bold text-foreground appearance-none focus:ring-0"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num} className="bg-card text-foreground">{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1.5 flex justify-end w-full">
              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground font-black text-xs tracking-widest uppercase rounded-2xl hover:brightness-110 shadow-lg hover:shadow-primary/20 transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Results Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters */}
          <div className="bg-card border border-border/40 rounded-[2rem] p-6 shadow-xl space-y-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                <h2 className="text-xs font-black tracking-widest uppercase">Sort & Filters</h2>
              </div>
              {(maxPrice !== null || Object.values(selectedTimeOfDay).some(v => v) || directOnly || selectedStopovers.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setMaxPrice(null);
                    setSelectedTimeOfDay({
                      earlyMorning: false,
                      morning: false,
                      afternoon: false,
                      evening: false,
                    });
                    setDirectOnly(false);
                    setSelectedStopovers([]);
                  }}
                  className="text-[10px] font-extrabold uppercase text-primary hover:underline transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground block">Sort By</span>
              <div className="flex flex-col gap-2">
                {[
                  { value: "price", label: "Lowest Price" },
                  { value: "time", label: "Departure Time" },
                  { value: "seats", label: "Available Seats" }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value as any)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      sortBy === option.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/30 text-muted-foreground border-border/20 hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="pt-4 border-t border-border/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Max Price</span>
                <span className="text-xs font-extrabold text-foreground bg-secondary/80 px-2 py-0.5 rounded-full border border-border/40">
                  ₹{maxPrice !== null ? maxPrice : highestPrice}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={highestPrice || 2000}
                value={maxPrice !== null ? maxPrice : highestPrice || 2000}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground"
              />
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
                <span>₹0</span>
                <span>₹{highestPrice || 2000}</span>
              </div>
            </div>

            {/* Time of Day Checkbox Filters */}
            <div className="pt-4 border-t border-border/30 space-y-3">
              <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground block">Departure Time</span>
              <div className="space-y-2">
                {[
                  { key: "earlyMorning", label: "Early Morning (Before 6 AM)" },
                  { key: "morning", label: "Morning (6 AM - 12 PM)" },
                  { key: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
                  { key: "evening", label: "Evening & Night (After 6 PM)" }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group text-xs text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={(selectedTimeOfDay as any)[item.key]}
                      onChange={(e) => setSelectedTimeOfDay(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-border/40 bg-secondary text-primary focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location / Direct & Stopovers Filters */}
            <div className="pt-4 border-t border-border/30 space-y-3">
              <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground block">Route & Stopovers</span>
              
              <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-muted-foreground hover:text-foreground mb-3">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(e) => {
                    setDirectOnly(e.target.checked);
                    if (e.target.checked) setSelectedStopovers([]); // Direct only overrides specific stopovers
                  }}
                  className="rounded border-border/40 bg-secondary text-primary focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold transition-colors">Direct Rides Only</span>
              </label>

              {availableStopovers.length > 0 && !directOnly && (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Passes Through</span>
                  <div className="max-h-28 overflow-y-auto space-y-2 pr-1 border border-border/10 rounded-lg p-2 bg-secondary/10">
                    {availableStopovers.map(stop => (
                      <label key={stop} className="flex items-center gap-2.5 cursor-pointer group text-xs text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedStopovers.includes(stop)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStopovers(prev => [...prev, stop]);
                            } else {
                              setSelectedStopovers(prev => prev.filter(s => s !== stop));
                            }
                          }}
                          className="rounded border-border/40 bg-secondary text-primary focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold truncate max-w-[150px] transition-colors">{stop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary statistics */}
            <div className="pt-4 border-t border-border/30 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>Rides Found:</span>
                <span className="text-foreground">{loading ? "..." : sortedRides.length}</span>
              </div>
              {fromQuery && (
                <div className="flex justify-between text-[10px] text-muted-foreground truncate">
                  <span>Route:</span>
                  <span className="text-foreground font-extrabold">{fromQuery} → {toQuery || "Any"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-card/50 border border-border/20 rounded-[2rem] p-6 sm:p-8 shadow-xl animate-pulse"
                  >
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/60" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-secondary/60 rounded" />
                            <div className="h-3 w-20 bg-secondary/40 rounded" />
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center mt-1.5 shrink-0">
                            <div className="w-3 h-3 rounded-full bg-secondary/60" />
                            <div className="w-0.5 h-8 bg-secondary/40 my-1" />
                            <div className="w-3 h-3 rounded-full bg-secondary/60" />
                          </div>
                          <div className="space-y-4 flex-1">
                            <div className="h-4 w-48 bg-secondary/60 rounded" />
                            <div className="h-4 w-36 bg-secondary/60 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-4 border-t md:border-t-0 md:border-l border-border/20 pt-5 md:pt-0 md:pl-8 min-w-[200px]">
                        <div className="h-10 w-full bg-secondary/40 rounded-2xl animate-pulse" />
                        <div className="h-10 w-full bg-secondary/40 rounded-2xl animate-pulse" />
                      </div>
                      <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-border/20 pt-5 md:pt-0 md:pl-8 min-w-[150px]">
                        <div className="h-8 w-16 bg-secondary/60 rounded animate-pulse" />
                        <div className="h-12 w-24 bg-secondary/60 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-card border border-border/40 rounded-[2rem] shadow-xl p-8">
                <SlidersHorizontal size={48} className="mx-auto text-destructive/40 mb-4 animate-bounce" />
                <h3 className="text-base font-black tracking-widest uppercase mb-2">Error loading rides</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSearchParams(searchParams);
                  }}
                  className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground hover:brightness-110 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all"
                >
                  Retry Search
                </button>
              </div>
            ) : sortedRides.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border/40 rounded-[2rem] shadow-xl p-8">
                <Compass size={48} className="mx-auto text-muted-foreground/30 mb-4 animate-pulse" />
                <h3 className="text-base font-black tracking-widest uppercase mb-2">No matching rides found</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
                  We couldn't find any posted rides for the route from "{fromQuery || 'Any'}" to "{toQuery || 'Any'}". Try searching other cities or adjusting filters!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFromInput("");
                    setToInput("");
                    setSearchParams({});
                  }}
                  className="mt-6 px-6 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 border border-border/50 rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-card border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-xl hover:border-border/80 transition-all duration-200 hover:shadow-2xl relative overflow-hidden group"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
                      {/* Driver info & Route details */}
                      <div className="flex-1 space-y-4">
                        {/* Driver Profile */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center font-black text-xs text-foreground shadow-sm">
                            {ride.driver.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-foreground">{ride.driver.name}</h4>
                              <span className="flex items-center gap-0.5 text-xs text-foreground font-bold bg-secondary border border-border px-2 py-0.5 rounded-full">
                                <Star size={10} className="fill-foreground text-foreground" />
                                {ride.driver.rating}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{ride.driver.trips} verified rides</p>
                          </div>
                        </div>

                        {/* Route Timeline */}
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center mt-1.5 shrink-0">
                            <div className="w-3 h-3 rounded-full bg-foreground" />
                            <div className="w-0.5 h-8 bg-border my-1" />
                            <div className="w-3 h-3 rounded-full border-2 border-foreground bg-background" />
                          </div>
                          <div className="space-y-4 flex-1 min-w-0">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Leaving From</p>
                              <p className="text-sm font-extrabold text-foreground truncate">{ride.from.name}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Going To</p>
                              <p className="text-sm font-extrabold text-foreground truncate">{ride.to.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ride Specifics (Time, Price, Seats) */}
                      <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-4 border-t md:border-t-0 md:border-l border-border/50 pt-5 md:pt-0 md:pl-8 min-w-[200px]">
                        <div className="bg-secondary/20 p-3 rounded-2xl flex items-center gap-3">
                          <Clock size={16} className="text-foreground shrink-0" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Departure</p>
                            <p className="text-xs font-bold text-foreground">{ride.time}</p>
                          </div>
                        </div>

                        <div className="bg-secondary/20 p-3 rounded-2xl flex items-center gap-3">
                          <Car size={16} className="text-foreground shrink-0" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Vehicle</p>
                            <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{ride.vehicle}</p>
                          </div>
                        </div>

                        <div className="bg-secondary/20 p-3 rounded-2xl flex items-center gap-3 col-span-2 md:col-span-1">
                          <Users size={16} className="text-foreground shrink-0" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Availability</p>
                            <p className="text-xs font-bold text-foreground">{ride.seats} seats remaining</p>
                          </div>
                        </div>
                      </div>

                      {/* CTA & Pricing */}
                      <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-border/50 pt-5 md:pt-0 md:pl-8 min-w-[150px]">
                        <div className="text-left md:text-center">
                          <span className="text-2xl font-black text-foreground">₹{ride.pricePerSeat}</span>
                          <span className="text-[10px] text-muted-foreground font-bold tracking-wider block uppercase">Per Seat</span>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => navigate(`/ride/${ride.id}`, { state: { driver: ride.driver, vehicle: ride.vehicle } })}
                            className="px-6 py-3 bg-secondary text-foreground hover:bg-secondary/80 font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-sm w-full"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleBook(ride)}
                            className="px-6 py-3 bg-foreground text-background hover:bg-foreground/90 font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-95 w-full"
                          >
                            Book Seat
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Rider description */}
                    {ride.description && (
                      <div className="mt-5 pt-4 border-t border-border/30 text-xs text-muted-foreground italic font-medium">
                        "{ride.description}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
