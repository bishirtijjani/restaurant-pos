import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      quote:
        "Toast wanted $150/month just for basic features. This has everything for $79.",
      name: "Marco R.",
      role: "Owner",
      restaurant: "Bella Italia Bistro",
      location: "Austin, TX",
    },
    {
      quote:
        "Setup took 15 minutes. We were taking orders the same afternoon. Support actually answers when you call.",
      name: "Sarah K.",
      role: "Manager",
      restaurant: "The Daily Grind Cafe",
      location: "Portland, OR",
    },
    {
      quote:
        "No more $3,000 terminals. Works perfectly on our iPads we already had. Saved us thousands.",
      name: "James L.",
      role: "Owner",
      restaurant: "Harbor Grill",
      location: "Seattle, WA",
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
            What Restaurant Owners Say
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Real feedback from operators who switched.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-8)",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Quote
                size={32}
                color="var(--color-accent)"
                style={{ marginBottom: "var(--space-4)", opacity: 0.3 }}
              />

              <p
                style={{
                  fontSize: "var(--font-size-lg)",
                  lineHeight: 1.7,
                  marginBottom: "var(--space-6)",
                  flex: 1,
                }}
              >
                "{testimonial.quote}"
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  alignItems: "center",
                }}
              >
                {/* Avatar Placeholder */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                  }}
                >
                  {testimonial.name[0]}
                </div>

                <div>
                  <div
                    style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}
                  >
                    {testimonial.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {testimonial.role}, {testimonial.restaurant}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
