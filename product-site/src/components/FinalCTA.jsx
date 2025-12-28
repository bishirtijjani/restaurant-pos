import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="section"
      style={{
        paddingTop: "var(--space-24)",
        paddingBottom: "var(--space-24)",
      }}
      ref={ref}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            backgroundColor: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-16)",
          }}
        >
          <h2 style={{ marginBottom: "var(--space-6)" }}>Ready to Ship?</h2>

          <p
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-12)",
              lineHeight: 1.6,
            }}
          >
            Join operators who value reliability over endless features.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              style={{
                fontSize: "var(--font-size-xl)",
                padding: "var(--space-6) var(--space-12)",
              }}
            >
              Start Free Trial
              <ArrowRight size={20} />
            </button>

            <button
              className="btn btn-secondary"
              style={{
                fontSize: "var(--font-size-xl)",
                padding: "var(--space-6) var(--space-12)",
              }}
            >
              Contact Sales
            </button>
          </div>

          <p
            style={{
              marginTop: "var(--space-8)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            Personal support from day one • No hidden fees • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
