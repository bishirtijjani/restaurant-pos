import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Smartphone, MessageCircle, Zap, Target } from "lucide-react";

export default function Philosophy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const pillars = [
    {
      icon: Smartphone,
      title: "Bring Your Own Hardware",
      description:
        "Toast charges $799 for their terminal. You already have an iPad.",
      details: "Works on iPad, Android tablets, or existing POS hardware",
    },
    {
      icon: MessageCircle,
      title: "Talk to Humans, Not Bots",
      description: "Need help? Text the founder. No tickets. No wait times.",
      details: "Personal support. Same-day response. Real relationships.",
    },
    {
      icon: Zap,
      title: "Workflows That Work",
      description:
        "We enforce proven processes. Your 'special way' is probably costing you money.",
      details: "One way to do things. The right way. No customization chaos.",
    },
    {
      icon: Target,
      title: "Strong Where It Matters",
      description:
        "POS, Inventory, Taxes, Reports. We don't waste time on gimmicks.",
      details: "Built for the 90% of daily tasks. Not the 10% edge cases.",
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
          <h2 style={{ marginBottom: "var(--space-4)" }}>
            We're Opinionated By Design
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Built for serious small and mid-size restaurants that value
            reliability over endless customization.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-8)",
          }}
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  <Icon size={28} color="var(--color-accent)" />
                </div>

                <h3
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  {pillar.description}
                </p>

                <p
                  style={{
                    fontSize: "var(--font-size-base)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {pillar.details}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
