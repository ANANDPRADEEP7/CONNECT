import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Side nav arrows */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10">
        <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={18} />
        </button>
        <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Taglines */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-16 mb-8 z-10">
        <span className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
          Connect Rides, Connect Lives.
        </span>
        <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
          Ride. Connect. Go.
        </span>
      </div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 px-4"
      >
        <h1
          className="text-5xl sm:text-7xl lg:text-[7rem] font-bold leading-[0.95] tracking-tight text-muted-foreground/40"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="block">BOOK.</span>
          <span className="block">BEYOND RIDES.</span>
          <span className="block">CONNECT.</span>
        </h1>
      </motion.div>

      {/* CTA */}
      <motion.a
        href="#search"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background text-sm tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity z-10"
      >
        Learn More <ArrowRight size={18} />
      </motion.a>

      {/* Decorative hands - using gradient shapes instead of images */}
      <div className="absolute bottom-0 left-0 w-64 h-80 bg-gradient-to-t from-muted/20 to-transparent rounded-tr-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-48 h-64 bg-gradient-to-t from-muted/20 to-transparent rounded-tl-full opacity-30 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
