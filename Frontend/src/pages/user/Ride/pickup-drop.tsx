import { useEffect, useRef, useState } from "react";
import { ChevronRight, MapPin, X } from "lucide-react";
import { toast } from "react-toastify";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../../../mapbox-overrides.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const IS_VALID_TOKEN = MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith("sk.");

// Modal Component for picking location on the Map
const MapSelectionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  onConfirm: (address: string, coords: [number, number]) => void 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !IS_VALID_TOKEN) return;

    if (!mapRef.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [78.9629, 20.5937], // India default
        zoom: 4,
        projection: "globe",
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

      // Force map to strictly calculate dimensions when loaded inside a Modal
      map.on("load", () => {
         map.resize();
         map.setFog({
           color: "rgb(15, 15, 20)",
           "high-color": "rgb(10, 10, 25)",
           "horizon-blend": 0.02,
         });
      });

      let marker: mapboxgl.Marker | null = null;

      // Geocoder Integration
      import("@mapbox/mapbox-gl-geocoder").then((module) => {
        const MapboxGeocoder = module.default;
        
        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = "";
          const geocoder = new MapboxGeocoder({
            accessToken: MAPBOX_TOKEN,
            placeholder: `Search ${title}...`,
            countries: "in",
            bbox: [68.1, 6.7, 97.4, 37.1],
            marker: false, // We'll handle our own marker
          });
          
          geocoder.addTo(geocoderContainerRef.current);
          geocoder.on("result", (e: any) => {
            const coords = e.result.center;
            const address = e.result.place_name;
            
            setSelectedAddress(address);
            setSelectedCoords(coords);
            
            if (marker) marker.remove();
            marker = new mapboxgl.Marker({ color: "#a855f7" }).setLngLat(coords).addTo(map);
            map.flyTo({ center: coords, zoom: 14 });
          });
        }
      });

      // Click on map to drop a pin
      map.on("click", async (e) => {
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        
        if (marker) marker.remove();
        marker = new mapboxgl.Marker({ color: "#a855f7" }).setLngLat(coords).addTo(map);
        
        // Reverse Geocode to get address
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_TOKEN}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            setSelectedAddress(data.features[0].place_name);
            setSelectedCoords(coords);
          } else {
            setSelectedAddress("Unknown Location");
            setSelectedCoords(coords);
          }
        } catch (err) {
          console.error(err);
        }
      });

      mapRef.current = map;
    }

    // Modal cleanup is not strictly necessary for map instance unless we want to rebuild it every time,
    // but leaving it alive caches the tiles and makes it super fast to reopen!
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 md:p-8">
      <div className="bg-card w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h3 className="font-bold tracking-widest uppercase text-foreground">{title}</h3>
          <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 text-foreground transition-all">
            <X size={20} />
          </button>
        </div>
        
        {/* Map Body */}
        <div className="flex-1 relative">
           {!IS_VALID_TOKEN ? (
             <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-center p-8 bg-secondary">
               <MapPin size={40} className="text-destructive" />
               <h3 className="font-bold text-lg text-foreground">Invalid or Missing Mapbox Token</h3>
               <p className="text-sm max-w-sm">Provide a public token in your .env file to enable Maps.</p>
             </div>
           ) : (
             <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
           )}
           
           {/* Floating Geocoder Search */}
           {IS_VALID_TOKEN && (
             <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-[50]">
               <div ref={geocoderContainerRef} className="mapbox-geocoder-wrapper rounded-2xl shadow-xl border border-border/50 bg-background/90 backdrop-blur" />
             </div>
           )}
        </div>
        
        {/* Footer info & confirm */}
        <div className="p-4 md:p-6 bg-secondary/30 border-t border-border flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex-1 w-full truncate text-center md:text-left">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold mb-1">Selected Location</p>
            <p className="font-semibold text-sm text-foreground truncate">{selectedAddress || "No location selected. Search or tap on the map."}</p>
          </div>
          <button 
            disabled={!selectedCoords}
            onClick={() => {
              if (selectedCoords) {
                onConfirm(selectedAddress, selectedCoords);
                onClose();
              }
            }}
            className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-full disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const LocationCard = ({
  title,
  buttonLabel,
  onLocationSelect,
}: {
  title: string;
  buttonLabel: string;
  onLocationSelect: (addr: string, coords: [number, number]) => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const handleConfirm = (addr: string, coords: [number, number]) => {
    setSelectedAddress(addr);
    onLocationSelect(addr, coords);
  };

  return (
    <>
      <div className="bg-card/80 backdrop-blur-md border border-border/40 rounded-3xl p-6 md:p-8 flex flex-col h-full shadow-lg hover:shadow-xl transition-all group">
        <h2 className="text-2xl font-bold tracking-widest uppercase mb-8" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>

        <div className="flex-1 flex flex-col">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-between bg-secondary/60 hover:bg-secondary/90 transition-all rounded-full px-6 py-5 mb-4 w-full text-left border border-border/50 group-hover:border-primary/50"
          >
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-[10px] tracking-widest font-bold uppercase text-muted-foreground block mb-1">
                {title === "Pick Up" ? "Departing from" : "Going to"}
              </span>
              <span className={`text-sm tracking-wider truncate w-full block ${selectedAddress ? "text-foreground font-bold" : "text-muted-foreground/60"}`}>
                {selectedAddress || "Tap to select on Map..."}
              </span>
            </div>
            <div className="bg-background rounded-full p-2 border border-border group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all shrink-0">
               <MapPin size={18} />
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
             if (selectedAddress) toast.success(`Confirmed: ${title}`);
             else setModalOpen(true);
          }}
          className="w-full rounded-full bg-foreground text-background text-sm tracking-[0.2em] uppercase font-bold py-4 hover:opacity-90 transition-opacity mt-auto"
        >
          {selectedAddress ? "Ready" : buttonLabel}
        </button>
      </div>

      <MapSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={title} 
        onConfirm={handleConfirm} 
      />
    </>
  );
};

const PostRideForm = () => {
  const handlePickup = (addr: string) => {
    toast.success("Pick Up Set!");
  };

  const handleDropoff = (addr: string) => {
    toast.success("Drop Off Set!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <LocationCard title="Pick Up" buttonLabel="Select Pick Up" onLocationSelect={handlePickup} />
      <LocationCard title="Drop Off" buttonLabel="Select Drop Off" onLocationSelect={handleDropoff} />
    </div>
  );
};

export default PostRideForm;
