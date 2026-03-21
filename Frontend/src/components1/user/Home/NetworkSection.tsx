import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const NetworkSection = () => {
  return (
    <section className="bg-background py-32 px-6">
      <div className="max-w-[1100px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-8">
            <ArrowDownRight size={14} /> Our Network
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-[2.8rem] font-light leading-snug text-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Find rides, share journeys, and connect with people heading your way.{" "}
            <strong className="font-bold">Affordable</strong>,{" "}
            <strong className="font-bold">convenient</strong>, and{" "}
            <strong className="font-bold">eco-friendly</strong> travel made simple.
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button className="px-8 py-4 rounded-full bg-secondary text-foreground text-xs tracking-[0.25em] uppercase font-semibold hover:bg-accent transition-colors">
            Find Out More
          </button>
          <button className="px-8 py-4 rounded-full border border-border text-foreground text-xs tracking-[0.25em] uppercase font-semibold hover:bg-secondary transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default NetworkSection;
