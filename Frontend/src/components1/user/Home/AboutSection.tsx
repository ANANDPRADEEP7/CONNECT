import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const features = [
  { title: "COST-EFFECTIVE" },
  { title: "ECO-FRIENDLY" },
  { title: "SAFE & SECURE" },
];

const AboutSection = () => {
  return (
    <section className="bg-foreground text-background py-24 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left - Reveal section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-background/10 rounded-2xl p-12 min-h-[500px] flex flex-col justify-center"
        >
          <div className="text-[4rem] sm:text-[5rem] lg:text-[6rem] font-black leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "hsl(60, 80%, 55%)" }}>
            REVEAL<br />
            THE BE[A]ST
          </div>
          <div className="mt-8">
            <span className="inline-block bg-[hsl(60,80%,55%)] text-background text-xs tracking-[0.2em] uppercase font-bold px-4 py-2">
              Unleash the future of ride-sharing.
            </span>
            <div className="mt-3 text-[hsl(60,80%,55%)]/60 text-sm space-y-1" style={{ fontFamily: "var(--font-body)" }}>
              <p>Smart.</p>
              <p>Seamless.</p>
              <p>Connected.</p>
            </div>
          </div>
        </motion.div>

        {/* Right - Who we are */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div>
            <span className="flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-bold mb-4">
              <ArrowRight size={16} /> Who We Are
            </span>
            <p className="text-background/70 leading-relaxed text-sm">
              A next-gen ride-sharing platform designed to make travel affordable, convenient, and community-driven. We believe in connecting people through seamless rides while reducing travel costs and environmental impact.
            </p>
          </div>

          <button className="inline-flex items-center px-8 py-4 rounded-full bg-background text-foreground text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity">
            Learn More
          </button>

          <div className="space-y-0 pt-4">
            {features.map((f, i) => (
              <div key={i} className="py-5 border-b border-background/20">
                <h3
                  className="text-xl sm:text-2xl tracking-wide font-medium"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {f.title}
                </h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
