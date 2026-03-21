import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const AboutUsSection = () => {
  return (
    <section className="bg-foreground text-background py-24 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left - Visual placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center"
        >
          <div className="w-72 h-96 bg-background/10 rounded-3xl flex items-center justify-center border border-background/10">
            <span
              className="text-6xl font-black text-background/20 rotate-[-10deg]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              co<span className="inline-block border border-background/30 rounded px-1 mx-0.5 text-4xl align-middle">n</span>nect
            </span>
          </div>
        </motion.div>

        {/* Right - About text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-background/50">
            <ArrowDownRight size={14} /> About Us
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-light leading-snug italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Seamless Rides. Smarter Connections. Trusted Journeys. Empowering Travel. Anytime, Anywhere.
          </h2>
          <button className="inline-flex items-center px-8 py-4 rounded-full bg-background text-foreground text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity mt-4">
            About Optinet
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;
