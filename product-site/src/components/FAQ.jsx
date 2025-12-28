import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does setup take?",
      answer:
        "Most restaurants complete setup in 10-30 minutes. We guide you through menu creation, tax settings, and staff accounts. If you need help, text us and we'll walk you through it.",
    },
    {
      question: "Do I need to buy hardware?",
      answer:
        "No. Our software works on any iPad, Android tablet, or existing POS terminal you already own. No expensive proprietary hardware required.",
    },
    {
      question: "Are there hidden fees?",
      answer:
        "$79/month per location. No setup fees, no contracts, no per-transaction fees if you use your own Stripe account. That's it.",
    },
    {
      question: "What if I need to cancel?",
      answer:
        "Cancel anytime. No penalties, no questions asked. We're month-to-month because we believe you should stay because you want to, not because you're locked in.",
    },
    {
      question: "What if I need help?",
      answer:
        "Text or call the founder directly. We respond same-day (usually within hours). No ticket systems, no offshore support, no waiting 48 hours for a canned response.",
    },
    {
      question: "What happens if the internet goes down?",
      answer:
        "The POS works offline. Orders are saved locally and automatically sync when your connection returns. You never lose a sale.",
    },
    {
      question: "Can I import my existing menu?",
      answer:
        "Yes. Upload a CSV or send us your current menu and we'll import it for you at no charge.",
    },
    {
      question: "Do you integrate with my payment processor?",
      answer:
        "We support Stripe (and your existing Stripe account). Unlike competitors, we don't force you into our payment processing or charge extra fees on transactions.",
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
            Frequently Asked Questions
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "var(--space-4)",
                overflow: "hidden",
                transition: "all var(--transition-base)",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                }}
              >
                {faq.question}
                <ChevronDown
                  size={20}
                  style={{
                    transition: "transform var(--transition-base)",
                    transform:
                      openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <div
                style={{
                  maxHeight: openIndex === index ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height var(--transition-base)",
                }}
              >
                <div
                  style={{
                    padding: "0 var(--space-6) var(--space-6)",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
