import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, IndianRupee,
  FileText, Loader2, RefreshCw, Navigation, GripVertical,
  Trash2, Plus, Save, ChevronUp, ChevronDown, AlertTriangle,
  Car, Star
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";
import { rideApi } from "../../../Endpoints/Api/ride/rideApi";
import type { Ride, Stopover } from "../../../types/ride/ride.types";
import { useAppSelector } from "../../../store/hooks";
import BookSeatModal from "../../../components1/user/Ride/BookSeatModal";
import { vehicleApi } from "../../../Endpoints/Api/vehicle/vehicleApi";
import type { Vehicle } from "../../../types/vehicle/vehicle.types";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../../../mapbox-overrides.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const IS_VALID_TOKEN = MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith("sk.");
mapboxgl.accessToken = MAPBOX_TOKEN;

// ── Format duration helper ───────────────────────────────────────────────────
function formatDuration(raw: string): string {
  if (!raw) return raw;
  // Try to parse total minutes from "Xh Ym", "Z min", or "H hours"
  const hMatch = raw.match(/(\d+)h\s*(\d+)m/);
  const minMatch = raw.match(/^(\d+)\s*min$/);
  let totalMins = 0;
  if (hMatch) {
    totalMins = parseInt(hMatch[1]) * 60 + parseInt(hMatch[2]);
  } else if (minMatch) {
    totalMins = parseInt(minMatch[1]);
  } else {
    const hrMatch = raw.match(/(\d+)\s*hours?/);
    if (hrMatch) {
      totalMins = parseInt(hrMatch[1]) * 60;
    } else {
      return raw;
    }
  }

  if (totalMins < 60 * 24) return raw;
  const days = Math.floor(totalMins / (60 * 24));
  const remHrs = Math.floor((totalMins % (60 * 24)) / 60);
  
  const dayStr = days === 1 ? "1 day" : `${days} days`;
  const hrStr = remHrs === 1 ? "1 hour" : `${remHrs} hours`;

  if (remHrs > 0) {
    return `${dayStr} ${hrStr}`;
  }
  return dayStr;
}

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Ride["status"] }) => {
  const cls =
    status === "active"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : status === "completed"
      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
      : "bg-red-500/10 text-red-500 border-red-500/20";
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border ${cls}`}>
      {status}
    </span>
  );
};

// ── Draggable stopover item ───────────────────────────────────────────────────
interface StopoverItemProps {
  stopover: Stopover;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, idx: number) => void;
    onDragOver: (e: React.DragEvent, idx: number) => void;
    onDrop: (e: React.DragEvent, idx: number) => void;
    onDragEnd: () => void;
  };
  isDragging: boolean;
  isOver: boolean;
}

const StopoverItem = ({
  stopover, index, total, onMoveUp, onMoveDown, onRemove,
  dragHandlers, isDragging, isOver
}: StopoverItemProps) => (
  <div
    draggable
    onDragStart={e => dragHandlers.onDragStart(e, index)}
    onDragOver={e => dragHandlers.onDragOver(e, index)}
    onDrop={e => dragHandlers.onDrop(e, index)}
    onDragEnd={dragHandlers.onDragEnd}
    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
      isDragging ? "opacity-40 scale-95" : isOver ? "border-primary/60 bg-primary/5 scale-[1.01]" : "border-border/50 bg-secondary/30"
    }`}
  >
    {/* Drag Handle */}
    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none shrink-0">
      <GripVertical size={16} />
    </div>

    {/* Dot */}
    <div className="w-3 h-3 rounded-full bg-foreground/70 border-2 border-background shadow shrink-0" />

    {/* Name */}
    <p className="flex-1 text-xs font-semibold text-foreground truncate">
      {stopover.name.split(",")[0]}
    </p>

    {/* Move controls */}
    <div className="flex flex-col gap-0.5 shrink-0">
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        className="p-0.5 rounded hover:bg-accent disabled:opacity-20 text-muted-foreground hover:text-foreground transition-colors"
        title="Move up"
      >
        <ChevronUp size={13} />
      </button>
      <button
        onClick={onMoveDown}
        disabled={index === total - 1}
        className="p-0.5 rounded hover:bg-accent disabled:opacity-20 text-muted-foreground hover:text-foreground transition-colors"
        title="Move down"
      >
        <ChevronDown size={13} />
      </button>
    </div>

    {/* Remove */}
    <button
      onClick={onRemove}
      className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors shrink-0"
      title="Remove stopover"
    >
      <Trash2 size={12} />
    </button>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const RideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  
  const searchState = location.state as { driver?: any, vehicle?: string } | null;

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopovers, setStopovers] = useState<Stopover[]>([]);
  const [stopoversDirty, setStopoversDirty] = useState(false);
  const [savingStopover, setSavingStopover] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<Vehicle | null>(null);

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const geocoderContainerRef = useRef<HTMLDivElement>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // ── Load Ride ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await rideApi.getRideById(id);
        const r = res as unknown as Ride;
        setRide(r);
        setStopovers(r.stopovers || []);
        if (r.distance) setDistance(r.distance);
        if (r.duration) setDuration(r.duration);

        if (r.vehicleId) {
          try {
            const vRes = await vehicleApi.getVehicleById(r.vehicleId);
            setVehicleDetails(vRes as unknown as Vehicle);
          } catch (e) {
            console.error("Failed to fetch vehicle details", e);
          }
        }
      } catch {
        toast.error("Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Init Map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !IS_VALID_TOKEN || !ride) return;

    const origin: [number, number] = ride.from
      ? [ride.from.longitude, ride.from.latitude]
      : [78.9629, 20.5937];
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: origin,
      zoom: 5,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      map.setFog({
        color: "rgb(15,15,20)",
        "high-color": "rgb(10,10,25)",
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
        paint: { "line-color": "#ffffff", "line-width": 4, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#ffffff", "line-width": 12, "line-opacity": 0.07, "line-blur": 6 },
      });
      setMapReady(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ride]);

  // ── Draw Route & Markers ───────────────────────────────────────────────────
  const drawRoute = useCallback(async (currentStopovers: Stopover[]) => {
    if (!mapRef.current || !mapReady || !ride) return;
    const origin: [number, number] | undefined = ride.from
      ? [ride.from.longitude, ride.from.latitude]
      : undefined;
    const dest: [number, number] | undefined = ride.to
      ? [ride.to.longitude, ride.to.latitude]
      : undefined;
    if (!origin || !dest) return;

    setRouteLoading(true);
    try {
      const coordsList: [number, number][] = [origin, ...currentStopovers.map(s => [s.coords.longitude, s.coords.latitude] as [number, number]), dest];
      const formatted = coordsList.map(c => `${c[0]},${c[1]}`).join(";");
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${formatted}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes?.length) { toast.error("Could not find route"); return; }

      const route = data.routes[0];
      const coords = route.geometry.coordinates;

      (mapRef.current!.getSource("route") as mapboxgl.GeoJSONSource)?.setData({
        type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {},
      });

      const km = (route.distance / 1000).toFixed(1);
      const totalMins = Math.round(route.duration / 60);
      const hrs = Math.floor(totalMins / 60);
      const remainMins = totalMins % 60;
      const rawDuration = hrs > 0 ? `${hrs}h ${remainMins}m` : `${totalMins} min`;
      setDistance(`${km} km`);
      setDuration(formatDuration(rawDuration));

      // Fit bounds
      const bounds = coords.reduce(
        (b: mapboxgl.LngLatBounds, c: [number, number]) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      mapRef.current!.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 80, right: 80 }, duration: 1000 });

      // Re-draw markers
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
      addMarker(origin, "origin", ride.from.name.split(",")[0]);
      addMarker(dest, "dest", ride.to.name.split(",")[0]);
      currentStopovers.forEach((s, i) => addMarker([s.coords.longitude, s.coords.latitude], `stop-${s.id}`, `Stop ${i + 1}: ${s.name.split(",")[0]}`));
    } catch {
      toast.error("Failed to update route");
    } finally {
      setRouteLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, ride]);

  useEffect(() => { if (mapReady && ride) drawRoute(stopovers); }, [mapReady]);

  const addMarker = (coords: [number, number], key: string, label: string) => {
    if (!mapRef.current) return;
    const el = document.createElement("div");
    let bg = "#888";
    if (key === "origin") bg = "#fff";
    else if (key === "dest") bg = "#fff";
    else bg = "#aaa";

    el.style.cssText = `
      width:${key.startsWith("stop") ? "14px" : "18px"};
      height:${key.startsWith("stop") ? "14px" : "18px"};
      border-radius:50%;
      background:${bg};
      border:3px solid ${key === "origin" ? "#000" : key === "dest" ? "#555" : "#333"};
      box-shadow:0 0 10px rgba(255,255,255,0.3);
      cursor:pointer;
    `;
    const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
      `<div style="font-size:11px;font-weight:700;padding:4px 6px">${label}</div>`
    );
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coords).setPopup(popup).addTo(mapRef.current!);
    markersRef.current[key] = marker;
  };

  // ── Geocoder for adding stopovers ─────────────────────────────────────────
  useEffect(() => {
    if (!geocoderContainerRef.current || !IS_VALID_TOKEN) return;
    import("@mapbox/mapbox-gl-geocoder").then(module => {
      const MapboxGeocoder = module.default;
      geocoderContainerRef.current!.innerHTML = "";
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: "Add a stopover city...",
        countries: "in",
        types: "place,locality",
        bbox: [68.1, 6.7, 97.4, 37.1],
      });
      geocoder.addTo(geocoderContainerRef.current!);
      geocoder.on("result", (e: { result: { place_name: string; center: [number, number] } }) => {
        const newStop: Stopover = {
          id: Date.now().toString(),
          name: e.result.place_name,
          coords: {
            name: e.result.place_name,
            longitude: e.result.center[0],
            latitude: e.result.center[1],
          },
        };
        setStopovers(prev => {
          const next = [...prev, newStop];
          drawRoute(next);
          return next;
        });
        setStopoversDirty(true);
        const input = geocoderContainerRef.current?.querySelector(".mapboxgl-ctrl-geocoder--input") as HTMLInputElement;
        if (input) input.value = "";
        geocoder.clear();
      });
    });
    return () => { if (geocoderContainerRef.current) geocoderContainerRef.current.innerHTML = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // ── Stopover actions ───────────────────────────────────────────────────────
  const handleRemoveStopover = (idx: number) => {
    setStopovers(prev => {
      const next = prev.filter((_, i) => i !== idx);
      drawRoute(next);
      return next;
    });
    setStopoversDirty(true);
  };

  const handleMoveStopover = (from: number, to: number) => {
    setStopovers(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      drawRoute(arr);
      return arr;
    });
    setStopoversDirty(true);
  };

  // ── Drag-and-drop handlers ─────────────────────────────────────────────────
  const handleDragStart = (_e: React.DragEvent, idx: number) => {
    dragIndexRef.current = idx;
    setDragIndex(idx);
  };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIndex(idx);
  };
  const handleDrop = (_e: React.DragEvent, toIdx: number) => {
    const fromIdx = dragIndexRef.current;
    if (fromIdx !== null && fromIdx !== toIdx) handleMoveStopover(fromIdx, toIdx);
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  // ── Save stopover changes ──────────────────────────────────────────────────
  const handleSaveStopovers = async () => {
    if (!ride) return;
    setSavingStopover(true);
    try {
      await rideApi.updateRide(ride.id, { stopovers, distance, duration });
      setStopoversDirty(false);
      toast.success("Stopovers saved successfully!");
    } catch {
      toast.error("Failed to save stopovers");
    } finally {
      setSavingStopover(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-bold">Loading ride...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-black tracking-widest uppercase">Ride not found</h2>
          <button onClick={() => navigate("/my-rides")} className="mt-4 text-xs text-muted-foreground underline">Back to My Rides</button>
        </div>
      </div>
    );
  }

  const hasCoords = !!(ride.from?.longitude && ride.from?.latitude && ride.to?.longitude && ride.to?.latitude);
  const isDriver = user?.id === ride.riderId;

  return (
    <div className="flex min-h-screen bg-background relative flex-col lg:flex-row overflow-hidden">
      {/* Navbar */}
      <div className="absolute top-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto"><Navbar /></div>
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:w-[44%] flex flex-col px-5 md:px-10 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground mb-7 transition-colors self-start"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={ride.status} />
            </div>
            <h1 className="text-2xl font-black tracking-widest uppercase leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Ride Details
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {ride.from.name.split(",")[0]} → {ride.to.name.split(",")[0]}
            </p>
          </div>
        </div>

        {/* ── Route card ── */}
        <div className="rounded-2xl bg-secondary/50 border border-border/40 p-5 mb-5">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-black mb-4">Route</p>

          <div className="space-y-3">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background shadow" />
                {stopovers.length > 0
                  ? <div className="w-px flex-1 bg-border/60 my-1 min-h-[24px]" />
                  : <div className="w-px h-8 bg-border/60 my-1" />}
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">From</p>
                <p className="text-sm font-bold">{ride.from.name.split(",")[0]}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">{ride.from.name}</p>
              </div>
            </div>

            {/* Stopovers in route */}
            {stopovers.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/50 border-2 border-background shadow" />
                  {i < stopovers.length - 1 || true
                    ? <div className="w-px h-8 bg-border/60 my-1" />
                    : null}
                </div>
                <div>
                  <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">Stopover {i + 1}</p>
                  <p className="text-xs font-semibold">{s.name.split(",")[0]}</p>
                </div>
              </div>
            ))}

            {/* Destination */}
            <div className="flex items-start gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-foreground/60 border-2 border-background shadow mt-1 shrink-0" />
              <div>
                <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-black">To</p>
                <p className="text-sm font-bold">{ride.to.name.split(",")[0]}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">{ride.to.name}</p>
              </div>
            </div>
          </div>

          {/* Distance / Duration */}
          {(distance || duration) && (
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-6">
              {distance && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Distance</p>
                  <p className="text-sm font-bold">{distance}</p>
                </div>
              )}
              {duration && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Duration</p>
                  <p className="text-sm font-bold">{formatDuration(duration)}</p>
                </div>
              )}
              {routeLoading && (
                <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                  <RefreshCw size={12} className="animate-spin" />
                  <span className="text-[10px] tracking-widest uppercase font-bold animate-pulse">Updating...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Ride Info Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            {
              icon: <Calendar size={13} />,
              label: "Date",
              value: new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
            },
            {
              icon: <Clock size={13} />,
              label: "Time",
              value: (() => {
                if (!ride.time) return "";
                const parts = ride.time.split(":");
                if (parts.length < 2) return ride.time;
                const h = Number(parts[0]);
                const m = Number(parts[1]);
                if (isNaN(h) || isNaN(m)) return ride.time;
                return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
              })()
            },
            { icon: <Users size={13} />, label: "Seats Available", value: `${ride.seats} seats` },
            { icon: <IndianRupee size={13} />, label: "Price / Seat", value: `₹${ride.pricePerSeat}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-secondary/30 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-1.5">{icon} {label}</div>
              <p className="text-xs font-bold text-foreground">{value}</p>
            </div>
          ))}
          {vehicleDetails ? (
            <div className="col-span-2 bg-secondary/30 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground"><Car size={13} /> Vehicle Details</div>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest font-bold">{vehicleDetails.type || "Standard"}</span>
              </div>
              <div className="flex gap-4 items-center">
                {vehicleDetails.images && vehicleDetails.images.length > 0 ? (
                  <img src={vehicleDetails.images[0]} alt={vehicleDetails.name} className="w-16 h-12 rounded object-cover border border-border/50" />
                ) : (
                  <div className="w-16 h-12 rounded bg-muted/30 flex items-center justify-center border border-border/50 text-muted-foreground"><Car size={20} /></div>
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{vehicleDetails.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{vehicleDetails.model} • {vehicleDetails.color || "No Color"} • {vehicleDetails.rcNumber}</p>
                </div>
              </div>
            </div>
          ) : (searchState?.vehicle || ride.vehicleId) && (
            <div className="col-span-2 bg-secondary/30 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-1.5"><Car size={13} /> Vehicle</div>
              <p className="text-xs font-bold text-foreground font-mono">{searchState?.vehicle || ride.vehicleId}</p>
            </div>
          )}
        </div>

        {/* ── Driver Info (for passengers) ── */}
        {!isDriver && searchState?.driver && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 mb-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center font-black text-sm text-foreground">
              {searchState.driver.avatar}
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-black mb-0.5">Driver</p>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{searchState.driver.name}</h4>
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded-md">
                  <Star size={10} className="fill-foreground text-foreground" /> {searchState.driver.rating}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">{searchState.driver.trips} verified rides</p>
            </div>
          </div>
        )}

        {/* Cancellation Details */}
        {ride.status === "cancelled" && ride.cancellation && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-red-500 mb-2">
              <AlertTriangle size={13} /> Cancellation Reason
            </div>
            <p className="text-xs text-red-500 font-bold leading-relaxed">
              "{ride.cancellation.reason}"
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-500/20">
              <span className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest">Cancelled By: {ride.cancellation.cancelledBy}</span>
              <span className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest">{new Date(ride.cancellation.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {ride.description && (
          <div className="bg-secondary/30 rounded-2xl p-4 border border-border/30 mb-5">
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-2"><FileText size={13} /> Notes</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{ride.description}</p>
          </div>
        )}

        {/* ── Stopovers Editor (only for active rides with coords) ── */}
        {ride.status === "active" && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1.5">
                <Navigation size={12} /> Stopovers
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[9px] font-bold border border-border/50">
                  {stopovers.length}
                </span>
              </p>
              {isDriver && stopoversDirty && (
                <button
                  onClick={handleSaveStopovers}
                  disabled={savingStopover}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-[9px] font-black tracking-widest uppercase transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {savingStopover ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                  {savingStopover ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            {/* Drag-and-drop list for driver, static list for passenger */}
            {stopovers.length === 0 ? (
              <div className="text-center py-5 rounded-2xl border border-dashed border-border/50 text-muted-foreground/50 text-xs">
                No stopovers.
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                {stopovers.map((s, i) => (
                  isDriver ? (
                    <StopoverItem
                      key={s.id}
                      stopover={s}
                      index={i}
                      total={stopovers.length}
                      onMoveUp={() => handleMoveStopover(i, i - 1)}
                      onMoveDown={() => handleMoveStopover(i, i + 1)}
                      onRemove={() => handleRemoveStopover(i)}
                      dragHandlers={{
                        onDragStart: handleDragStart,
                        onDragOver: handleDragOver,
                        onDrop: handleDrop,
                        onDragEnd: handleDragEnd,
                      }}
                      isDragging={dragIndex === i}
                      isOver={overIndex === i}
                    />
                  ) : (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-secondary/30">
                      <div className="w-3 h-3 rounded-full bg-foreground/70 border-2 border-background shadow shrink-0" />
                      <p className="flex-1 text-xs font-semibold text-foreground truncate">{s.name.split(",")[0]}</p>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Add stopover geocoder (Driver only) */}
            {isDriver && hasCoords && IS_VALID_TOKEN && (
              <div>
                <label className="text-[9px] tracking-widest uppercase text-muted-foreground font-black flex items-center gap-1 mb-1.5">
                  <Plus size={10} /> Add stopover city
                </label>
                <div
                  ref={geocoderContainerRef}
                  className="mapbox-geocoder-wrapper rounded-2xl border border-border/50 focus-within:border-primary/50 transition-all bg-secondary/80 relative z-30"
                />
              </div>
            )}

            {!hasCoords && (
              <p className="text-[10px] text-muted-foreground/60 italic mt-2">
                Map coordinates not available for this ride — stopover map is disabled.
              </p>
            )}
          </div>
        )}

        {/* Ride ID & Passenger CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-muted-foreground/40 tracking-wider">Ride ID: {ride.id}</p>
          {!isDriver && ride.status === "active" && (
            <button
              onClick={() => setShowBookModal(true)}
              className="px-6 py-3.5 bg-foreground text-background hover:bg-foreground/90 font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-95 w-full sm:w-auto"
            >
              Book Seat
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL – MAP ── */}
      <div className="w-full lg:w-[56%] flex-1 h-[50vh] lg:h-screen relative p-2 pb-6 lg:p-5 lg:pl-0 lg:pt-24">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-2xl relative">
          {!IS_VALID_TOKEN ? (
            <div className="w-full h-full bg-secondary/50 flex flex-col items-center justify-center gap-4 text-muted-foreground text-center p-8">
              <MapPin size={40} className="opacity-30" />
              <h3 className="font-black text-base tracking-widest uppercase text-foreground">Map unavailable</h3>
              <p className="text-sm max-w-xs">Add a valid Mapbox public token to enable the route map view.</p>
            </div>
          ) : !hasCoords ? (
            <div className="w-full h-full bg-secondary/50 flex flex-col items-center justify-center gap-4 text-muted-foreground text-center p-8">
              <Navigation size={40} className="opacity-30" />
              <h3 className="font-black text-base tracking-widest uppercase text-foreground">Coordinates not stored</h3>
              <p className="text-sm max-w-xs">This ride was created before coordinate tracking was enabled. The map cannot render the route.</p>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}

          {/* Route loading overlay */}
          {routeLoading && (
            <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-6">
              <div className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] tracking-widest uppercase font-black px-5 py-2.5 rounded-full border border-border flex items-center gap-2 animate-pulse">
                <RefreshCw size={13} className="animate-spin" />
                Updating route...
              </div>
            </div>
          )}

          {/* Stat pill overlay */}
          {hasCoords && (distance || duration) && !routeLoading && (
            <div className="absolute top-3 left-3 bg-background/85 backdrop-blur-sm rounded-2xl border border-border/60 px-4 py-2.5 flex items-center gap-4 shadow-lg">
              {distance && (
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Dist</p>
                  <p className="text-xs font-black">{distance}</p>
                </div>
              )}
              {duration && (
                <div className="border-l border-border/50 pl-4">
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Time</p>
                  <p className="text-xs font-black">{formatDuration(duration)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showBookModal && ride && (
        <BookSeatModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          ride={ride}
        />
      )}
    </div>
  );
};

export default RideDetailPage;
