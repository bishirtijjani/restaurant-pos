import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShoppingCart, Monitor, Package } from "lucide-react";

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: ShoppingCart,
      title: "Point of Sale",
      description: "Take orders. Multiple payment methods. Done.",
      highlights: [
        "Dine-in, takeaway, delivery",
        "Split payments, tips, change",
        "Table management",
        "Works offline",
      ],
    },
    {
      icon: Monitor,
      title: "Kitchen Display",
      description: "Real-time routing. No printers needed.",
      highlights: [
        "Multi-station routing",
        "Order status tracking",
        "Real-time updates",
        "Recall & modify orders",
      ],
    },
    {
      icon: Package,
      title: "Inventory Control",
      description:
        "Ingredient-level tracking. Auto-deduction. Low-stock alerts.",
      highlights: [
        "Recipe-based deduction",
        "Low-stock WhatsApp alerts",
        "Supplier management",
        "Waste tracking",
      ],
    },
  ];

  return (
    <section className="section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: "var(--space-16)" }}
        >
          <h2 style={{ marginBottom: "var(--space-4)" }}>
            Three Core Pillars. Nothing More.
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Strong where it matters daily. Weak nowhere critical to operations.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-8)",
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.95 }
                }
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
                style={{ height: "100%" }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "var(--color-bg-elevated)",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  <Icon
                    size={32}
                    color="var(--color-accent)"
                    strokeWidth={1.5}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  {feature.description}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {feature.highlights.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBottom: "var(--space-3)",
                        color: "var(--color-text-muted)",
                        fontSize: "var(--font-size-base)",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          backgroundColor: "var(--color-accent)",
                          borderRadius: "50%",
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
