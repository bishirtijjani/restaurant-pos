import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, ArrowRight } from "lucide-react";

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const comparison = [
    { feature: "Hardware", them: "$799-$3,000", us: "Use your own" },
    { feature: "Monthly Software", them: "$150+", us: "$79" },
    { feature: "Payment Processing", them: "Locked-in", us: "Your Stripe" },
    { feature: "Support", them: "Ticket system", us: "Direct line" },
    { feature: "Contract", them: "12-36 months", us: "Month-to-month" },
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
            One Price. Everything Included.
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            No contracts. No hardware lock-in. No hidden fees.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            maxWidth: "800px",
            margin: "0 auto var(--space-16)",
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg-primary)" }}>
                <th
                  style={{
                    padding: "var(--space-6)",
                    textAlign: "left",
                    fontSize: "var(--font-size-lg)",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    padding: "var(--space-6)",
                    textAlign: "center",
                    fontSize: "var(--font-size-lg)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Them
                </th>
                <th
                  style={{
                    padding: "var(--space-6)",
                    textAlign: "center",
                    fontSize: "var(--font-size-lg)",
                    color: "var(--color-accent)",
                  }}
                >
                  Us
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, index) => (
                <tr
                  key={index}
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <td style={{ padding: "var(--space-6)", fontWeight: 600 }}>
                    {row.feature}
                  </td>
                  <td
                    style={{
                      padding: "var(--space-6)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <X size={16} color="#EF4444" />
                      {row.them}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "var(--space-6)",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <Check size={16} color="var(--color-accent)" />
                      {row.us}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "var(--color-bg-primary)",
            border: "2px solid var(--color-accent)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-12)",
            boxShadow: "0 0 40px rgba(255, 107, 53, 0.15)",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "var(--space-8)" }}>
            <div
              style={{
                fontSize: "var(--font-size-5xl)",
                fontWeight: 700,
                marginBottom: "var(--space-2)",
              }}
            >
              $79
              <span
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 400,
                  color: "var(--color-text-secondary)",
                }}
              >
                /month
              </span>
            </div>
            <p style={{ color: "var(--color-text-secondary)" }}>per location</p>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 var(--space-8)",
              textAlign: "left",
            }}
          >
            {[
              "Unlimited POS devices (your hardware)",
              "Kitchen Display System",
              "Inventory management",
              "Advanced reporting",
              "Personal support (text/call the founder)",
              "Bring your own payment processor",
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--font-size-lg)",
                }}
              >
                <Check size={20} color="var(--color-accent)" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              fontSize: "var(--font-size-xl)",
              padding: "var(--space-6)",
            }}
          >
            Start 14-Day Free Trial
            <ArrowRight size={20} />
          </button>

          <p
            style={{
              marginTop: "var(--space-6)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
