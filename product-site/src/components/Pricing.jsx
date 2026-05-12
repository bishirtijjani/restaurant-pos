import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, ArrowRight } from "lucide-react";

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const comparison = [
    {
      feature: "Hardware",
      them: "AED 3,500–14,000 upfront",
      us: "Use existing iPads, tablets, laptops, desktops (no required purchases)",
      usBetter: true,
    },
    {
      feature: "Monthly Fee",
      them: "AED 700+ / location",
      us: "AED 599 flat for all locations",
      usBetter: true,
    },
    {
      feature: "Payments",
      them: "Proprietary Lock-in",
      us: "Integrated Stripe Payments",
      usBetter: true,
    },
    {
      feature: "Support",
      them: "Ticket waitlist",
      us: "Founder direct line",
      usBetter: true,
    },
    {
      feature: "Contract",
      them: "1-3 Year Lock-in",
      us: "Month-to-month",
      usBetter: true,
    },
    {
      feature: "Hidden Fees",
      them: "Setup & Training",
      us: "Zero hidden costs",
      usBetter: true,
    },
  ];

  return (
    <section
      className="section bg-gray-50 border-t border-gray-200 py-24"
      id="pricing"
      ref={ref}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="badge">
              Early Access Pricing (Founding Partners)
            </span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight text-[--color-text-primary]">
            One Rate. Operational Freedom.
          </h2>
          <p className="mx-auto text-xl text-gray-500 max-w-[600px] leading-relaxed">
            Pricing applies during the Early Access phase and is permanently
            locked for Founding Partners. We don't tax your growth. No setup
            fees, no contracts, no hardware markup.
          </p>
        </div>

        {/* Comparison HUD - UNIFIED ALIGNED GRID */}
        <div className="overflow-x-auto -mx-4 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
            className="min-w-[600px] max-w-[900px] mx-auto mb-20 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl grid grid-cols-[1.2fr_1fr_1fr]"
          >
          {/* Column Headers */}
          <div className="contents">
            {["Feature", "Competitors", "Codeket"].map((header, i) => (
              <div
                key={header}
                className={`p-6 px-8 bg-gray-50 border-b border-gray-200 font-mono text-[0.7rem] tracking-widest uppercase font-extrabold text-left ${
                  i === 2 ? "text-accent" : "text-gray-400"
                }`}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {comparison.map((row, index) => (
            <div key={index} className="contents group">
              {/* 1. Feature Name */}
              <div
                className={`p-5 px-8 font-extrabold text-[--color-text-primary] text-[0.95rem] border-gray-100 flex items-center ${
                  index === comparison.length - 1 ? "border-b-0" : "border-b"
                }`}
              >
                {row.feature}
              </div>

              {/* 2. Competitors Data */}
              <div
                className={`p-5 px-8 border-gray-100 flex items-center gap-3 ${
                  index === comparison.length - 1 ? "border-b-0" : "border-b"
                }`}
              >
                <div className="w-5 flex justify-center shrink-0">
                  <X size={16} className="text-red-500 stroke-[3px]" />
                </div>
                <span className="text-[0.9rem] text-gray-500 font-medium">
                  {row.them}
                </span>
              </div>

              {/* 3. Codeket Data - Highlight Slab */}
              <div
                className={`p-5 px-8 bg-orange-50/20 border-l border-orange-100/50 flex items-center gap-3 ${
                  index === comparison.length - 1
                    ? "border-b-0"
                    : "border-b border-gray-100"
                }`}
              >
                <div className="w-5 flex justify-center shrink-0">
                  <Check size={18} className="text-accent stroke-[4px]" />
                </div>
                <span className="text-[0.95rem] font-bold text-[--color-text-primary]">
                  {row.us}
                </span>
              </div>
            </div>
          ))}
          </motion.div>
        </div>

        {/* Pricing Card - Centered Focus */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-[500px] mx-auto bg-white border-2 border-[--color-text-primary] rounded-3xl p-12 shadow-2xl text-center"
        >
          <div className="mb-10">
            <div className="text-7xl font-extrabold text-[--color-text-primary] mb-2 tracking-tighter">
              AED 599
              <span className="text-2xl font-normal text-gray-400">/mo</span>
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-3">
              Or AED 5,990/year per location (2 months free for annual plan)
            </p>
            <p className="text-gray-400 font-mono text-[0.7rem] font-bold uppercase tracking-widest">
              UNLIMITED DEVICES • PER LOCATION • FULL OFFLINE MODE • GRANULAR
              TAX CONTROL
            </p>
          </div>

          <div className="flex flex-col gap-4 mx-auto mb-10 text-left max-w-[350px]">
            {[
              "Zero hardware spend — save AED 5,000+ on day one",
              "Unlimited Front-of-House POS",
              "Unlimited Kitchen Displays (KDS)",
              "Drag & Drop Floor & Table Management With Reservations",
              "Live Inventory & Waste Tracking",
              "Advanced Multi-Store Reporting",
              "Direct Human Support (Call/Text)",
              "Freedom to use Integrated Stripe Payments",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 text-base text-gray-600 font-medium"
              >
                <Check size={18} className="text-accent stroke-[2.5px]" />
                {item}
              </div>
            ))}
          </div>

          <a
            href="https://app.restaurant.codeket.com/register"
            className="btn btn-primary w-full p-5 rounded-full font-bold"
          >
            Start Your Free Trial
            <ArrowRight size={20} className="ml-2" />
          </a>

          <p className="mt-8 text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest">
            No credit card required • Personal support
          </p>
        </motion.div>
      </div>
    </section>
  );
}
