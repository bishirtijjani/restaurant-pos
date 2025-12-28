import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Clock, Settings, Rocket } from "lucide-react";

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Clock,
      title: "Sign Up",
      description: "Create your account in 60 seconds. No credit card needed.",
      time: "1 minute",
    },
    {
      icon: Settings,
      title: "Set Up",
      description:
        "Add your menu and preferences. We guide you through every step.",
      time: "10 minutes",
    },
    {
      icon: Rocket,
      title: "Go Live",
      description:
        "Start taking orders same day. We're on call if you need help.",
      time: "Same day",
    },
  ];

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
          style={{ marginBottom: "var(--space-16)" }}
        >
          <h2 style={{ marginBottom: "var(--space-4)" }}>How It Works</h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Get started in minutes, not weeks.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-12)",
            position: "relative",
          }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.5, delay: index * 0.2 }}
                style={{ textAlign: "center", position: "relative" }}
              >
                {/* Step Number */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "var(--color-accent)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto var(--space-6)",
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto var(--space-6)",
                  }}
                >
                  <Icon size={36} color="var(--color-accent)" />
                </div>

                {/* Content */}
                <h3
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--font-size-base)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-4)",
                    lineHeight: 1.7,
                  }}
                >
                  {step.description}
                </p>
                <div
                  style={{
                    display: "inline-block",
                    padding: "var(--space-2) var(--space-4)",
                    backgroundColor: "var(--color-bg-primary)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    color: "var(--color-accent)",
                  }}
                >
                  {step.time}
                </div>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50px",
                      right: "-20px",
                      display: "none",
                      "@media (min-width: 768px)": {
                        display: "block",
                      },
                    }}
                  >
                    <ArrowRight size={24} color="var(--color-text-muted)" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
