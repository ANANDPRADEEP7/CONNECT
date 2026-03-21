import { MapPin, Calendar, Users } from "lucide-react";

const SearchBar = () => {
  return (
    <section id="search" className="bg-background py-6">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Leaving from...</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <MapPin size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Going to...</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <Calendar size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Select Date</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary rounded-lg px-5 py-4">
            <Users size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">No. of Traveler</span>
          </div>
          <button className="flex items-center justify-center bg-foreground text-background rounded-lg px-5 py-4 text-sm tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
