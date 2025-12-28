import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";

export default function ProductDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="section"
      style={{ backgroundColor: "var(--color-bg-secondary)" }}
      ref={ref}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: "var(--space-12)" }}
        >
          <h2 style={{ marginBottom: "var(--space-4)" }}>See It In Action</h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Watch how real restaurants use our system daily.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            aspectRatio: "16/9",
            backgroundColor: "var(--color-bg-elevated)",
            border: "2px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Placeholder for actual video/screenshot */}
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-8)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(255, 107, 53, 0.1)",
                border: "3px solid var(--color-accent)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-6)",
                transition: "all var(--transition-base)",
              }}
            >
              <Play
                size={36}
                color="var(--color-accent)"
                fill="var(--color-accent)"
              />
            </div>
            <p
              style={{
                fontSize: "var(--font-size-lg)",
                color: "var(--color-text-secondary)",
              }}
            >
              Watch 2-minute product tour
            </p>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                marginTop: "var(--space-2)",
              }}
            >
              See actual POS, KDS, and Inventory in use
            </p>
          </div>
        </motion.div>

        {/* Screenshot Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-6)",
            marginTop: "var(--space-12)",
          }}
        >
          {["POS Interface", "Kitchen Display", "Inventory Dashboard"].map(
            (title, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-4)",
                  aspectRatio: "4/3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p style={{ color: "var(--color-text-muted)" }}>
                  {title} Screenshot
                </p>
              </div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
