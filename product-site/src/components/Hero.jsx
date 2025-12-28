import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="section"
      style={{
        paddingTop: "var(--space-24)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {/* Headline */}
          <h1 style={{ marginBottom: "var(--space-6)" }}>
            Operations-First Restaurant Software
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-12)",
            }}
          >
            Works on the hardware you already own. No contracts. No BS.
          </p>

          {/* Hardware Comparison */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-6)",
              marginBottom: "var(--space-12)",
            }}
          >
            {/* Them */}
            <div
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-8)",
                opacity: 0.7,
              }}
            >
              <X
                size={32}
                color="#EF4444"
                style={{ marginBottom: "var(--space-4)" }}
              />
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Them
              </p>
              <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 600 }}>
                $3,000 terminal
              </p>
              <p style={{ color: "var(--color-text-secondary)" }}>
                + $150/month software
              </p>
            </div>

            {/* Us */}
            <div
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "2px solid var(--color-accent)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-8)",
                boxShadow: `0 0 20px rgba(255, 107, 53, 0.2)`,
              }}
            >
              <Check
                size={32}
                color="var(--color-accent)"
                style={{ marginBottom: "var(--space-4)" }}
              />
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Us
              </p>
              <p style={{ fontSize: "var(--font-size-xl)", fontWeight: 600 }}>
                Your iPad
              </p>
              <p style={{ color: "var(--color-text-secondary)" }}>
                + $79/month software
              </p>
            </div>
          </div>

          {/* Primary CTA */}
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
          </div>

          {/* Trust Signal */}
          <p
            style={{
              marginTop: "var(--space-8)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            No credit card required • Personal support • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
