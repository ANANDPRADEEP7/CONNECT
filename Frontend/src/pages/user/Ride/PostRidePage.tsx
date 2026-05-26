import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, MapPin, Navigation } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components1/common/Navbar/Navbar";

// Mapbox imports
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../../../mapbox-overrides.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const IS_VALID_TOKEN = MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith("sk.");
mapboxgl.accessToken = MAPBOX_TOKEN;



// ───Schema ───────────────────────────────────────────────────────────────────
const postRideSchema = z.object({
  startingFrom: z.string().trim().min(2, "Starting location is required").max(200),
  destination: z.string().trim().min(2, "Destination is required").max(200),
  passengers: z.coerce.number().min(1, "At least 1 passenger").max(10, "Maximum 10 passengers"),
});

type PostRideValues = z.infer<typeof postRideSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-500 font-mono whitespace-pre-wrap">{this.state.error?.toString()}{"\n\n"}{this.state.error?.stack}</div>;
    }
    return this.props.children;
  }
}

const PostRidePageContent = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostRideValues>({
    resolver: zodResolver(postRideSchema),
    defaultValues: { startingFrom: "", destination: "", passengers: 1 },
  });

  const startingFromWatcher = watch("startingFrom");
  const destinationWatcher = watch("destination");

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originGeocoderContainerRef = useRef<HTMLDivElement>(null);
  const destGeocoderContainerRef = useRef<HTMLDivElement>(null);

  // ── State ───────────────────────────────────────────────────────────────────
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // ── Init Map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !IS_VALID_TOKEN) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [78.9629, 20.5937], // India default
      zoom: 4,
      projection: "globe",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80 }), "bottom-left");

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

  // ── Init Geocoders ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!originGeocoderContainerRef.current || !destGeocoderContainerRef.current) return;
    if (!IS_VALID_TOKEN) return;

    // Load Mapbox Geocoder dynamically to avoid Vite process/global polyfill crashes on startup
    import("@mapbox/mapbox-gl-geocoder").then((module) => {
      const MapboxGeocoder = module.default;

      // Clear previous geocoder children (hot-reload safety)
      originGeocoderContainerRef.current!.innerHTML = "";
      destGeocoderContainerRef.current!.innerHTML = "";

      // Origin Geocoder
      const originGeocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: "STARTING FROM...",
        countries: "in",
        types: "place,locality,neighborhood,address,poi",
        bbox: [68.1, 6.7, 97.4, 37.1], // India bounding box
      });
      originGeocoder.addTo(originGeocoderContainerRef.current!);
      originGeocoder.on("result", (e: { result: { place_name: string; center: [number, number] } }) => {
        setValue("startingFrom", e.result.place_name, { shouldValidate: true });
        setOriginCoords(e.result.center);
      });
      originGeocoder.on("clear", () => {
        setValue("startingFrom", "", { shouldValidate: true });
        setOriginCoords(null);
      });

      // Destination Geocoder
      const destGeocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: "DESTINATION...",
        countries: "in",
        types: "place,locality,neighborhood,address,poi",
        bbox: [68.1, 6.7, 97.4, 37.1],
      });
      destGeocoder.addTo(destGeocoderContainerRef.current!);
      destGeocoder.on("result", (e: { result: { place_name: string; center: [number, number] } }) => {
        setValue("destination", e.result.place_name, { shouldValidate: true });
        setDestCoords(e.result.center);
      });
      destGeocoder.on("clear", () => {
        setValue("destination", "", { shouldValidate: true });
        setDestCoords(null);
      });

      // Cleanups inside promise since removing instances has to be possible later or handled differently
    });

    return () => {
      // Basic cleanup (since geocoders attach inputs, clearing innerHTML resets them mostly).
      if (originGeocoderContainerRef.current) originGeocoderContainerRef.current.innerHTML = "";
      if (destGeocoderContainerRef.current) destGeocoderContainerRef.current.innerHTML = "";
    };
  }, [setValue]);

  // ── Draw Route ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!originCoords || !destCoords || !mapRef.current || !mapReady) return;

    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) {
          toast.error("Could not find a route between the selected locations.");
          return;
        }

        const route = data.routes[0];
        const coords = route.geometry.coordinates;

        // Update route source
        const source = mapRef.current!.getSource("route") as mapboxgl.GeoJSONSource;
        source.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        });

        // Distance & Duration
        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);
        const hrs = Math.floor(mins / 60);
        const remainMins = mins % 60;
        setDistance(`${km} km`);
        setDuration(hrs > 0 ? `${hrs}h ${remainMins}m` : `${mins} min`);

        // Fit map to route bounds
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, coord: [number, number]) => b.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        mapRef.current!.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, duration: 1200 });

        // Add / move markers
        addMarker(originCoords, "origin");
        addMarker(destCoords, "dest");
      } catch (err) {
        console.error("Route fetch failed:", err);
        toast.error("Failed to fetch route. Please try again.");
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [originCoords, destCoords, mapReady]);

  // ── Marker helper ────────────────────────────────────────────────────────────
  const markersRef = useRef<{ origin?: mapboxgl.Marker; dest?: mapboxgl.Marker }>({});
  const addMarker = (coords: [number, number], type: "origin" | "dest") => {
    if (!mapRef.current) return;
    if (markersRef.current[type]) markersRef.current[type]!.remove();

    const el = document.createElement("div");
    el.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: ${type === "origin" ? "#a855f7" : "#ec4899"};
      border: 3px solid white; box-shadow: 0 0 12px ${type === "origin" ? "#a855f7" : "#ec4899"};
    `;

    const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(mapRef.current!);
    markersRef.current[type] = marker;
  };

  // ── Clear route when locations cleared ──────────────────────────────────────
  useEffect(() => {
    if (!originCoords && !destCoords && mapRef.current && mapReady) {
      const source = mapRef.current.getSource("route") as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData({ type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} });
      }
      setDistance("");
      setDuration("");
      Object.values(markersRef.current).forEach((m) => m?.remove());
      markersRef.current = {};
    }
  }, [originCoords, destCoords, mapReady]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = (data: PostRideValues) => {
    toast.success(
      `🚗 Ride Published!\n${data.startingFrom} → ${data.destination}\n${data.passengers} passenger(s)${distance ? ` · ${distance}` : ""}${duration ? ` · ${duration}` : ""}`
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden flex-col lg:flex-row">
      {/* Navbar */}
      <div className="absolute top-0 w-full z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {/* ── LEFT PANEL – FORM ── */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-4 md:px-12 pt-28 pb-12 z-10 bg-card/95 backdrop-blur shadow-2xl overflow-y-auto">
        <h2
          className="text-2xl font-bold tracking-widest uppercase mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Post Ride
        </h2>

        {/* No Token Warning */}
        {!IS_VALID_TOKEN && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">
            {MAPBOX_TOKEN.startsWith("sk.") ? (
              <>⚠️ Mapbox requires a <b>Public Token (pk.*)</b>, but a Secret Token (sk.*) was provided in <code>.env</code>.</>
            ) : (
              <>⚠️ Mapbox token missing. Add <code className="font-mono text-xs">VITE_MAPBOX_ACCESS_TOKEN</code> to your <code>.env</code> file.</>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Starting From – Geocoder */}
          <div className="space-y-1">
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">
              Starting From
            </label>
            <div
              id="origin-geocoder"
              ref={originGeocoderContainerRef}
              className="mapbox-geocoder-wrapper rounded-2xl border border-border/50 focus-within:border-primary/50 transition-all bg-secondary/80 relative z-50"
            />
            {/* Hidden field for validation */}
            <input type="hidden" value={startingFromWatcher} {...register("startingFrom")} />
            {errors.startingFrom && (
              <p className="text-red-500 text-xs px-4 mt-1 font-medium">{errors.startingFrom.message}</p>
            )}
          </div>

          {/* Destination – Geocoder */}
          <div className="space-y-1">
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold px-1">
              Destination
            </label>
            <div
              id="dest-geocoder"
              ref={destGeocoderContainerRef}
              className="mapbox-geocoder-wrapper rounded-2xl border border-border/50 focus-within:border-primary/50 transition-all bg-secondary/80 relative z-40"
            />
            <input type="hidden" value={destinationWatcher} {...register("destination")} />
            {errors.destination && (
              <p className="text-red-500 text-xs px-4 mt-1 font-medium">{errors.destination.message}</p>
            )}
          </div>

          {/* Passengers + Route Stats */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 bg-secondary/80 rounded-full px-5 py-3 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-background rounded-full p-2 border border-border">
                  <User size={16} className="text-primary" />
                </div>
                <input
                  {...register("passengers")}
                  type="number"
                  min={1}
                  max={10}
                  className="w-12 bg-transparent border-none text-sm tracking-widest uppercase focus:outline-none p-0 h-auto font-bold text-center appearance-none"
                  style={{ MozAppearance: "textfield" }}
                />
                <span className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">Passengers</span>
              </div>

              {/* Live route stats */}
              {routeLoading ? (
                <div className="flex items-center gap-1 text-primary animate-pulse">
                  <Navigation size={12} />
                  <span className="text-[10px] tracking-widest uppercase font-bold">Calculating...</span>
                </div>
              ) : (
                distance && duration && (
                  <div className="text-right flex flex-col me-2 pe-2 border-l border-border/50">
                    <span className="text-[10px] text-primary tracking-wider uppercase font-bold">{duration}</span>
                    <span className="text-[10px] text-muted-foreground tracking-wider uppercase">{distance}</span>
                  </div>
                )
              )}
            </div>
            {errors.passengers && (
              <p className="text-red-500 text-xs px-4 mt-1 font-medium">{errors.passengers.message}</p>
            )}
          </div>

          {/* Route Summary Card */}
          {originCoords && destCoords && distance && !routeLoading && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                <div className="w-px h-8 bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase font-semibold text-foreground truncate">{startingFromWatcher}</p>
                <p className="text-xs tracking-widest uppercase font-semibold text-foreground truncate">{destinationWatcher}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{duration}</p>
                <p className="text-xs text-muted-foreground">{distance}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary text-primary-foreground text-sm tracking-widest uppercase font-bold py-4 mt-4 hover:brightness-110 disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/20"
          >
            {isSubmitting ? "PUBLISHING..." : "PUBLISH RIDE"}
          </button>
        </form>
      </div>

      {/* ── RIGHT PANEL – MAPBOX MAP ── */}
      <div className="w-full lg:w-[60%] flex-1 h-[45vh] lg:h-screen relative p-2 pb-6 lg:p-6 lg:pl-0 lg:pt-28">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-2xl relative">
          {!IS_VALID_TOKEN ? (
            <div className="w-full h-full bg-secondary flex items-center justify-center flex-col gap-4 text-muted-foreground p-8 text-center">
              <MapPin size={40} className="text-destructive" />
              <h3 className="font-bold text-lg text-foreground">
                {MAPBOX_TOKEN.startsWith("sk.") ? "Invalid Mapbox Token" : "Missing Mapbox Token"}
              </h3>
              <p className="text-sm max-w-sm">
                {MAPBOX_TOKEN.startsWith("sk.")
                  ? "Mapbox GL JS does not allow Secret Tokens (sk.*) to be used on the frontend for security reasons. Please generate a Public Token (pk.*) from your Mapbox dashboard."
                  : "Add your Mapbox access token to the .env file."
                }
              </p>
              <code className="text-xs font-mono bg-background px-4 py-2 rounded-lg text-primary block break-all border border-border mt-2">
                VITE_MAPBOX_ACCESS_TOKEN="pk.eyJ1..."
              </code>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}

          {/* Route loading overlay pulse */}
          {routeLoading && (
            <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-8">
              <div className="bg-background/80 backdrop-blur-sm text-primary text-xs tracking-widest uppercase font-bold px-5 py-2.5 rounded-full border border-primary/30 flex items-center gap-2 animate-pulse">
                <Navigation size={14} />
                Plotting route...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostRidePage = () => (
  <ErrorBoundary>
    <PostRidePageContent />
  </ErrorBoundary>
);

export default PostRidePage;
