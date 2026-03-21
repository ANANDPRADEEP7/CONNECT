import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const SolutionsSection = () => {
  return (
    <section className="bg-foreground text-background py-24 px-6">
      <div className="max-w-[1100px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-background/60 mb-6">
            <ArrowDownRight size={14} /> Solutions
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-light leading-snug"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Make your journey{" "}
            <strong className="font-bold">Smarter, Safer</strong> and more{" "}
            <strong className="font-bold">Social</strong> by bringing travelers together
          </h2>
        </motion.div>

        {/* Decorative wave lines */}
        <div className="mt-16 h-32 relative overflow-hidden opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-0 right-0 border-t border-background/40"
              style={{
                height: `${20 + i * 12}px`,
                borderRadius: "50%",
                transform: `translateX(${i * 30}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
