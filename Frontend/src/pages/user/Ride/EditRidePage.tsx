import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, DollarSign, Calendar, Clock,
  CheckCircle2, Zap, ClipboardList, Trash2, GripVertical,
  Navigation, IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { rideApi } from "../../../Endpoints/Api/ride/rideApi";
import type { Ride, Coordinate, Stopover } from "../../../types/ride/ride.types";

// Mapbox imports
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../../../mapbox-overrides.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const IS_VALID_TOKEN = MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith("sk.");
mapboxgl.accessToken = MAPBOX_TOKEN;

const EditRidePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ride, setRide] = useState<Ride | null>(null);

  // Form Fields
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState(0);
  const [bookingMode, setBookingMode] = useState<"instant" | "review">("instant");

  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [stopovers, setStopovers] = useState<Stopover[]>([]);

  // Map & Route Stats
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Geocoder key — incrementing this forces a fresh geocoder mount after each addition
  const [geocoderKey, setGeocoderKey] = useState(0);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const geocoderContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Ride Data
  useEffect(() => {
    const fetchRide = async () => {
      if (!id) return;
      try {
        const res = await rideApi.getRideById(id);
        const data = (res as any).data || res;
        setRide(data);

        setDate(data.date.split("T")[0]);
        setTime(data.time);
        setSeats(data.seats);
        setPrice(data.pricePerSeat);

        const mode = data.description?.toLowerCase().includes("review") ? "review" : "instant";
        setBookingMode(mode);

        setOrigin(data.from);
        setDestination(data.to);
        setStopovers(data.stopovers || []);

        if (data.distance) setDistance(data.distance);
        if (data.duration) setDuration(data.duration);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch ride details");
        navigate("/my-rides");
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id, navigate]);

  // 2. Initialize Map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current || !IS_VALID_TOKEN) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [78.9629, 20.5937],
      zoom: 4,
      projection: "globe",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      map.setFog({
        color: "rgb(15, 15, 20)",
        "high-color": "rgb(10, 10, 25)",
        "horizon-blend": 0.02,
      });

      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#a855f7",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loading]);

  // 3. Geocoder — remounts whenever geocoderKey changes (after each stopover addition)
  useEffect(() => {
    if (!geocoderContainerRef.current || !IS_VALID_TOKEN || loading) return;

    let geocoderInstance: any = null;

    import("@mapbox/mapbox-gl-geocoder").then((module) => {
      // Bail out if container was removed while the dynamic import was in flight
      if (!geocoderContainerRef.current) return;

      const MapboxGeocoder = module.default;
      geocoderContainerRef.current.innerHTML = "";

      geocoderInstance = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: "Search to add a stopover...",
        countries: "in",
        types: "place,locality,neighborhood,address,poi",
      });

      geocoderInstance.addTo(geocoderContainerRef.current);

      geocoderInstance.on("result", (e: any) => {
        const newStopover: Stopover = {
          id: Date.now().toString(),
          name: e.result.place_name,
          coords: {
            name: e.result.place_name,
            longitude: e.result.center[0],
            latitude: e.result.center[1],
          },
          price: undefined,
        };
        setStopovers((prev) => [...prev, newStopover]);
        // Re-key to remount a fresh geocoder so the input is truly cleared
        setGeocoderKey((k) => k + 1);
      });
    });

    return () => {
      if (geocoderContainerRef.current) geocoderContainerRef.current.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, geocoderKey]);

  // 4. Update Route & Markers whenever origin, dest, or stopovers change
  useEffect(() => {
    if (!mapReady || !origin || !destination || !mapRef.current) return;

    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const points = [
          `${origin.longitude},${origin.latitude}`,
          ...stopovers.map((s) => `${s.coords.longitude},${s.coords.latitude}`),
          `${destination.longitude},${destination.latitude}`,
        ].join(";");

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${points}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) {
          toast.error("Could not find a route connecting all locations.");
          return;
        }

        const route = data.routes[0];
        const coords = route.geometry.coordinates;

        const source = mapRef.current!.getSource("route") as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
            properties: {},
          });
        }

        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);
        const hrs = Math.floor(mins / 60);
        setDistance(`${km} km`);
        setDuration(hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins} min`);

        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, coord: [number, number]) => b.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        mapRef.current!.fitBounds(bounds, { padding: 60, duration: 1000 });

        Object.values(markersRef.current).forEach((m) => m.remove());
        markersRef.current = {};

        const addMarker = (lngLat: [number, number], markerId: string, color: string) => {
          const el = document.createElement("div");
          el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}`;
          markersRef.current[markerId] = new mapboxgl.Marker({ element: el })
            .setLngLat(lngLat)
            .addTo(mapRef.current!);
        };

        addMarker([origin.longitude, origin.latitude], "origin", "#a855f7");
        addMarker([destination.longitude, destination.latitude], "dest", "#ec4899");
        stopovers.forEach((s) =>
          addMarker([s.coords.longitude, s.coords.latitude], s.id, "#06b6d4")
        );
      } catch (err) {
        console.error("Route fetch failed", err);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [mapReady, origin, destination, stopovers]);

  // ── Stopover helpers ──────────────────────────────────────────────────────
  const moveStopover = (index: number, direction: -1 | 1) => {
    const next = [...stopovers];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setStopovers(next);
  };

  const removeStopover = (index: number) => {
    setStopovers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStopoverPrice = useCallback((index: number, val: string) => {
    setStopovers((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, price: val === "" ? undefined : Number(val) } : s
      )
    );
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!id || !ride) return;
    setSaving(true);
    try {
      const payload = {
        date,
        time,
        seats: Number(seats),
        pricePerSeat: Number(price),
        description: `Booking: ${bookingMode === "instant" ? "Instant" : "Review required"}`,
        stopovers,
        distance,
        duration,
      };

      await rideApi.updateRide(id, payload);
      toast.success("Ride updated successfully");
      navigate("/my-rides");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update ride");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar />
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ride) return null;

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden flex-col lg:flex-row">
      <div className="absolute top-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto"><Navbar /></div>
      </div>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex flex-col px-6 md:px-12 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <button
          onClick={() => navigate("/my-rides")}
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-6 transition-colors self-start"
        >
          <ArrowLeft size={14} /> Back to My Rides
        </button>

        <h1 className="text-2xl font-black tracking-widest uppercase mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          Edit Ride
        </h1>

        <div className="space-y-8">

          {/* ── Base Info ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-secondary/80 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">Time</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-secondary/80 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">Seats</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" min={1} max={10} value={seats} onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-secondary/80 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">Price / Seat (₹)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-secondary/80 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>

          {/* ── Booking Mode ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">Booking Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBookingMode("instant")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${bookingMode === "instant" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-500" : "border-border/50 bg-secondary/40 text-muted-foreground hover:bg-secondary/80"}`}
              >
                <Zap size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Instant</span>
              </button>
              <button
                onClick={() => setBookingMode("review")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${bookingMode === "review" ? "border-blue-500/50 bg-blue-500/10 text-blue-500" : "border-border/50 bg-secondary/40 text-muted-foreground hover:bg-secondary/80"}`}
              >
                <ClipboardList size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Review</span>
              </button>
            </div>
          </div>

          {/* ── Stopovers ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                Route &amp; Stopovers
              </label>
              {stopovers.length > 0 && (
                <span className="text-[9px] font-bold tracking-widest text-cyan-500 uppercase">
                  {stopovers.length} stop{stopovers.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="bg-secondary/30 border border-border/50 rounded-2xl p-4 space-y-4">
              {/* Origin */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] shrink-0" />
                <p className="text-sm font-bold text-foreground truncate">{origin?.name}</p>
              </div>

              {/* Stopovers list */}
              <div className="space-y-2 pl-1.5 ml-0 border-l border-border/50">
                {stopovers.map((stop, i) => (
                  <div
                    key={stop.id}
                    className="relative group bg-card border border-border/50 rounded-xl p-3 ml-4 shadow-sm hover:border-cyan-500/30 transition-colors"
                  >
                    {/* connector nub */}
                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-px bg-border/50" />

                    {/* Top row: dot + name + controls */}
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0" />
                      <p className="text-xs font-semibold flex-1 truncate">{stop.name}</p>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveStopover(i, -1)}
                          disabled={i === 0}
                          title="Move up"
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical size={14} />
                        </button>
                        <button
                          onClick={() => moveStopover(i, 1)}
                          disabled={i === stopovers.length - 1}
                          title="Move down"
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical size={14} className="rotate-90" />
                        </button>
                        <button
                          onClick={() => removeStopover(i)}
                          className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price input for this stopover */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <IndianRupee size={12} className="text-cyan-500 shrink-0" />
                      <input
                        type="number"
                        min={0}
                        placeholder="Boarding price (optional)"
                        value={stop.price ?? ""}
                        onChange={(e) => updateStopoverPrice(i, e.target.value)}
                        className="flex-1 bg-secondary/60 border border-border/40 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
                      />
                      <span className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase shrink-0">₹ / seat</span>
                    </div>
                  </div>
                ))}

                {/* Add Stopover geocoder */}
                <div className="ml-4 mt-2">
                  <div className="text-xs text-muted-foreground font-semibold mb-2 ml-1">Add Stopover</div>
                  {/* key prop forces a clean remount after each result */}
                  <div key={geocoderKey} ref={geocoderContainerRef} className="mapbox-geocoder-wrapper-small bg-secondary/80 rounded-xl border border-border/50 overflow-hidden" />
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] shrink-0" />
                <p className="text-sm font-bold text-foreground truncate">{destination?.name}</p>
              </div>
            </div>
          </div>

          {/* ── Save Button ───────────────────────────────────────────── */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-primary text-primary-foreground text-sm tracking-widest uppercase font-bold py-4 hover:brightness-110 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              : <CheckCircle2 size={16} />}
            {saving ? "Saving Changes..." : "Save Ride Changes"}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL – MAP ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[55%] flex-1 h-[45vh] lg:h-screen relative p-2 pb-6 lg:p-6 lg:pl-0 lg:pt-28">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-2xl relative">
          <div ref={mapContainerRef} className="w-full h-full bg-secondary" />

          {/* Stats Overlay */}
          {distance && duration && (
            <div className="absolute top-6 right-6 bg-card/90 backdrop-blur border border-border/50 rounded-2xl px-5 py-3 shadow-xl">
              <div className="flex gap-6">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Total Dist</p>
                  <p className="text-sm font-black text-primary mt-0.5">{distance}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Est Time</p>
                  <p className="text-sm font-black text-primary mt-0.5">{duration}</p>
                </div>
              </div>
            </div>
          )}

          {routeLoading && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-primary text-xs tracking-widest uppercase font-bold px-5 py-2.5 rounded-full border border-primary/30 flex items-center gap-2 animate-pulse">
              <Navigation size={14} /> Recalculating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRidePage;
