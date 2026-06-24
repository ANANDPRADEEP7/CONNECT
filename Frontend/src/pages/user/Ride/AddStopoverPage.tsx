import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Trash2, MapPin, Navigation, Check, Loader2, RefreshCw } from "lucide-react";
import Navbar from "../../../components1/common/Navbar/Navbar";
import type { Coordinate } from "../../../types/ride/ride.types";

// Mapbox imports
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../../../mapbox-overrides.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const IS_VALID_TOKEN = MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith("sk.");
mapboxgl.accessToken = MAPBOX_TOKEN;

interface Stopover {
  id: string;
  name: string;
  coords: Coordinate;
}

const AddStopoverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get state from PostRidePage
  const rideState = location.state as {
    startingFrom?: string;
    destination?: string;
    passengers?: number;
    distance?: string;
    duration?: string;
    originCoords?: Coordinate;
    destCoords?: Coordinate;
  } | null;

  // Fallback coords if somehow not provided (e.g. Bangalore to Chennai)
  const defaultOriginCoord: Coordinate = rideState?.originCoords || {
    name: "Bangalore, Karnataka, India",
    longitude: 77.5946,
    latitude: 12.9716,
  };
  const defaultDestCoord: Coordinate = rideState?.destCoords || {
    name: "Chennai, Tamil Nadu, India",
    longitude: 80.2707,
    latitude: 13.0827,
  };
  // Mapbox tuple form [lng, lat]
  const defaultOrigin: [number, number] = [defaultOriginCoord.longitude, defaultOriginCoord.latitude];
  const defaultDest: [number, number] = [defaultDestCoord.longitude, defaultDestCoord.latitude];

  const originName = rideState?.startingFrom || "Starting Point";
  const destName = rideState?.destination || "Destination Point";

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // ── State ───────────────────────────────────────────────────────────────────
  const [stopovers, setStopovers] = useState<Stopover[]>([]);
  const [distance, setDistance] = useState(rideState?.distance || "");
  const [duration, setDuration] = useState(rideState?.duration || "");
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const stopoversRef = useRef<Stopover[]>([]);
  useEffect(() => {
    stopoversRef.current = stopovers;
  }, [stopovers]);


  // ── Init Map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !IS_VALID_TOKEN) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: defaultOrigin,
      zoom: 6,
      projection: "globe",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // Atmosphere effect
      map.setFog({
        color: "rgb(15, 15, 20)",
        "high-color": "rgb(10, 10, 25)",
        "horizon-blend": 0.02,
      });

      // Route source & layer
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
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#d8b4fe",
          "line-width": 10,
          "line-opacity": 0.15,
          "line-blur": 4,
        },
      });

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Init Search Geocoder ────────────────────────────────────────────────────
  useEffect(() => {
    if (!geocoderContainerRef.current || !IS_VALID_TOKEN) return;

    import("@mapbox/mapbox-gl-geocoder").then((module) => {
      const MapboxGeocoder = module.default;
      geocoderContainerRef.current!.innerHTML = "";

      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: "SEARCH STOPOVER CITY...",
        countries: "in",
        types: "place,locality",
        bbox: [68.1, 6.7, 97.4, 37.1],
      });

      geocoder.addTo(geocoderContainerRef.current!);

      geocoder.on("result", async (e: { result: { place_name: string; center: [number, number] } }) => {
        const newStopover: Stopover = {
          id: Date.now().toString(),
          name: e.result.place_name,
          coords: {
            name: e.result.place_name,
            longitude: e.result.center[0],
            latitude: e.result.center[1],
          },
        };

        setRouteLoading(true);
        try {
          const coordsList = [defaultOrigin, ...stopoversRef.current.map((s) => [s.coords.longitude, s.coords.latitude] as [number, number]), [newStopover.coords.longitude, newStopover.coords.latitude] as [number, number], defaultDest];
          const formattedCoords = coordsList.map((c) => `${c[0]},${c[1]}`).join(";");

          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${formattedCoords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
          const res = await fetch(url);
          const data = await res.json();

          if (!data.routes || data.routes.length === 0) {
            toast.error(`Could not find a route passing through ${e.result.place_name.split(",")[0]}.`);
            return;
          }

          setStopovers((prev) => [...prev, newStopover]);
          toast.success(`Stopover added: ${e.result.place_name.split(",")[0]}`);
        } catch (err) {
          toast.error("Failed to verify route for the new stopover.");
        } finally {
          setRouteLoading(false);
          const input = geocoderContainerRef.current?.querySelector(".mapboxgl-ctrl-geocoder--input") as HTMLInputElement;
          if (input) input.value = "";
          geocoder.clear();
        }
      });
    });

    return () => {
      if (geocoderContainerRef.current) geocoderContainerRef.current.innerHTML = "";
    };
  }, []);

  // ── Draw Route & Markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        // Construct coordinates list: Origin -> Stopovers -> Destination
        const coordsList = [defaultOrigin, ...stopovers.map((s) => [s.coords.longitude, s.coords.latitude] as [number, number]), defaultDest];
        const formattedCoords = coordsList.map((c) => `${c[0]},${c[1]}`).join(";");

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${formattedCoords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) {
          toast.error("Could not find a route with the selected stopovers.");
          return;
        }

        const route = data.routes[0];
        const coords = route.geometry.coordinates;

        // Update route source
        const source = mapRef.current!.getSource("route") as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
            properties: {},
          });
        }

        // Distance & Duration
        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);
        const hrs = Math.floor(mins / 60);
        const remainMins = mins % 60;
        setDistance(`${km} km`);
        setDuration(hrs > 0 ? `${hrs}h ${remainMins}m` : `${mins} min`);

        // Fit map bounds
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, coord: [number, number]) => b.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        mapRef.current!.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          duration: 1200,
        });

        // Update markers
        // Remove old markers
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};

        // Add origin marker
        addMarker(defaultOrigin, "origin", "Origin");
        // Add destination marker
        addMarker(defaultDest, "dest", "Destination");
        // Add stopover markers
        stopovers.forEach((stop, index) => {
          addMarker([stop.coords.longitude, stop.coords.latitude], `stop-${stop.id}`, `Stopover ${index + 1}: ${stop.name.split(",")[0]}`);
        });

      } catch (err) {
        console.error("Route recalculation failed:", err);
        toast.error("Failed to update route.");
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [stopovers, mapReady]);

  // Marker helper
  const addMarker = (coords: [number, number], key: string, label: string) => {
    if (!mapRef.current) return;

    const el = document.createElement("div");
    let bg = "#a855f7"; // default purple
    let shadow = "#a855f7";
    let size = "18px";

    if (key === "origin") {
      bg = "#a855f7"; // Origin: Purple
      shadow = "#a855f7";
      size = "20px";
    } else if (key === "dest") {
      bg = "#ec4899"; // Destination: Pink
      shadow = "#ec4899";
      size = "20px";
    } else {
      bg = "#06b6d4"; // Stopover: Cyan
      shadow = "#06b6d4";
      size = "16px";
    }

    el.style.cssText = `
      width: ${size}; height: ${size}; border-radius: 50%;
      background: ${bg}; border: 3px solid white;
      box-shadow: 0 0 14px ${shadow}; cursor: pointer;
    `;

    // Tooltip
    const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
      `<div class="text-xs font-bold text-background p-1">${label}</div>`
    );

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coords)
      .setPopup(popup)
      .addTo(mapRef.current!);

    markersRef.current[key] = marker;
  };

  // Remove Stopover Handler
  const handleRemoveStopover = (id: string) => {
    setStopovers((prev) => prev.filter((s) => s.id !== id));
  };

  // Continue to date selection
  const handleContinue = () => {
    navigate("/ride-date", {
      state: {
        ...rideState,
        stopovers,
        distance,
        duration,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden flex-col lg:flex-row">
      {/* Navbar */}
      <div className="absolute top-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between px-4 md:px-12 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl lg:h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground mb-6 uppercase transition-colors self-start shrink-0"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h2 className="text-2xl font-bold tracking-widest uppercase mb-1 shrink-0" style={{ fontFamily: "var(--font-heading)" }}>
            Add Stopover
          </h2>
          <p className="text-xs text-muted-foreground tracking-wide mb-6 shrink-0">
            Get up to 2x more passengers by offering stopovers along your route.
          </p>

          {/* Route Details Card */}
          <div className="rounded-2xl bg-secondary/60 border border-border/40 p-5 mb-6 flex flex-col min-h-0 max-h-[38vh]">
            <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3 shrink-0">
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Primary Route</span>
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                {routeLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span className="animate-pulse">Recalculating...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={13} />
                    <span>{duration} ({distance})</span>
                  </>
                )}
              </div>
            </div>

            {/* Timeline Route Visual - Scrollable container */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-thin min-h-0">
              {/* Origin */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="w-px h-8 bg-border/80 my-1" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Origin</p>
                  <p className="text-xs font-bold text-foreground truncate">{originName}</p>
                </div>
              </div>

              {/* Stopovers sequence */}
              {stopovers.map((stop, idx) => (
                <div key={stop.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="w-px h-8 bg-border/80 my-1" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-cyan-400 font-semibold">Stopover {idx + 1}</p>
                      <p className="text-xs font-bold text-foreground truncate">{stop.name}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStopover(stop.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Destination</p>
                  <p className="text-xs font-bold text-foreground truncate">{destName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Geocoder inputs */}
          <div className="space-y-3 mb-6 shrink-0">
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold px-1">
              Add a Stopover City
            </label>
            <div
              id="stopover-geocoder"
              ref={geocoderContainerRef}
              className="mapbox-geocoder-wrapper rounded-2xl border border-border/50 focus-within:border-primary/50 transition-all bg-secondary/80 relative z-50"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 shrink-0">
          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-4 border border-border rounded-full text-xs font-bold tracking-widest uppercase text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            Skip & Exit
          </button>
          <button
            onClick={handleContinue}
            disabled={routeLoading}
            className="flex-1 py-4 bg-primary hover:brightness-110 text-primary-foreground rounded-full text-xs font-bold tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check size={14} />
            Continue
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL – MAPBOX MAP ── */}
      <div className="w-full lg:w-[60%] flex-1 h-[45vh] lg:h-screen relative p-2 pb-6 lg:p-6 lg:pl-0 lg:pt-28">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-2xl relative">
          {!IS_VALID_TOKEN ? (
            <div className="w-full h-full bg-secondary flex items-center justify-center flex-col gap-4 text-muted-foreground p-8 text-center">
              <MapPin size={40} className="text-destructive" />
              <h3 className="font-bold text-lg text-foreground">Missing Mapbox Token</h3>
              <p className="text-sm max-w-sm">Please provide a valid token to visualize the route with stopovers.</p>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}

          {/* Recalculating route pulse */}
          {routeLoading && (
            <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-8">
              <div className="bg-background/80 backdrop-blur-sm text-primary text-xs tracking-widest uppercase font-bold px-5 py-2.5 rounded-full border border-primary/30 flex items-center gap-2 animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                Updating route...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStopoverPage;
