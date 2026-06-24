import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users } from "lucide-react";
import { useState } from "react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [leavingFrom, setLeavingFrom] = useState("");
  const [goingTo, setGoingTo] = useState("");

  const handleLeavingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLeavingFrom(val);
    navigate(`/search?from=${encodeURIComponent(val)}&to=${encodeURIComponent(goingTo)}`);
  };

  const handleGoingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGoingTo(val);
    navigate(`/search?from=${encodeURIComponent(leavingFrom)}&to=${encodeURIComponent(val)}`);
  };

  const handleSearchSubmit = () => {
    navigate(`/search?from=${encodeURIComponent(leavingFrom)}&to=${encodeURIComponent(goingTo)}`);
  };

  return (
    <section id="search" className="bg-background py-6">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Leaving From */}
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-foreground" />
            <input
              type="text"
              placeholder="LEAVING FROM..."
              value={leavingFrom}
              onChange={handleLeavingChange}
              className="bg-transparent border-none outline-none text-xs tracking-[0.2em] uppercase text-foreground placeholder:text-muted-foreground w-full font-semibold focus:ring-0"
            />
          </div>

          {/* Going To */}
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <MapPin size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="GOING TO..."
              value={goingTo}
              onChange={handleGoingChange}
              className="bg-transparent border-none outline-none text-xs tracking-[0.2em] uppercase text-foreground placeholder:text-muted-foreground w-full font-semibold focus:ring-0"
            />
          </div>

          {/* Date Selector (leads to search directly) */}
          <div 
            onClick={handleSearchSubmit}
            className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4 cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <Calendar size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground select-none">Select Date</span>
          </div>

          {/* Passengers Selector (leads to search directly) */}
          <div 
            onClick={handleSearchSubmit}
            className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4 cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <Users size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground select-none">No. of Traveler</span>
          </div>

          <button 
            onClick={handleSearchSubmit}
            className="flex items-center justify-center bg-foreground text-background rounded-lg px-5 py-4 text-sm tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
