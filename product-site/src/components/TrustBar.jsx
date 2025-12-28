import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Zap, Lock } from "lucide-react";

export default function TrustBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        padding: "var(--space-12) 0",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
      ref={ref}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: "var(--space-8)" }}
        >
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-text-secondary)",
            }}
          >
            Trusted by{" "}
            <strong style={{ color: "var(--color-accent)" }}>
              50+ restaurants
            </strong>{" "}
            across 12 cities
          </p>
        </motion.div>

        {/* Restaurant Logos Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "var(--space-8)",
            marginBottom: "var(--space-12)",
            opacity: 0.6,
          }}
        >
          {[
            "Bistro One",
            "Cafe Central",
            "The Grill House",
            "Pizza Express",
            "Sushi Bar",
            "Taco Stop",
          ].map((name, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-4)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              {name}
            </div>
          ))}
        </motion.div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-8)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Shield size={18} color="var(--color-accent)" />
            <span>Bank-level encryption</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Zap size={18} color="var(--color-accent)" />
            <span>99.9% uptime</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Lock size={18} color="var(--color-accent)" />
            <span>GDPR compliant</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
