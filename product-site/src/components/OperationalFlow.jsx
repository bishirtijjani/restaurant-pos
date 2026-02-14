import { motion } from "framer-motion";
import {
  Smartphone,
  ChefHat,
  RotateCcw,
  BarChart3,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function OperationalFlow() {
  // Unique ambient glow colors per step
  const glowColors = [
    "rgba(255, 107, 53, 0.15)", // Orange
    "rgba(99, 102, 241, 0.15)", // Indigo
    "rgba(16, 185, 129, 0.15)", // Emerald
    "rgba(168, 85, 247, 0.15)", // Purple
  ];

  const borderGlowColors = [
    "rgba(255, 107, 53, 0.3)",
    "rgba(99, 102, 241, 0.3)",
    "rgba(16, 185, 129, 0.3)",
    "rgba(168, 85, 247, 0.3)",
  ];

  const images = [
    { src: "/assets/pos.png", alt: "POS System" },
    { src: "/assets/kds.png", alt: "Kitchen Display System" },
    { src: "/assets/inventory.png", alt: "Inventory Management" },
    { src: "/assets/analytics.png", alt: "Analytics Dashboard" },
  ];

  const steps = [
    {
      icon: Smartphone,
      phase: "Orders & Service Execution",
      title: "From Table",
      desc: "Orders are created once and flow through tables, counters, and devices without duplication or resync.",
      highlight: "No Duplication",
      annotations: ["Live order tracking", "Multi-device sync"],
    },
    {
      icon: ChefHat,
      phase: "Kitchen & Preparation Flow",
      title: "To Kitchen",
      desc: "Orders route automatically to the correct stations with timing, notes, and status updates in real time.",
      highlight: "Real-Time Sync",
      annotations: ["Auto-routing", "Station management"],
    },
    {
      icon: RotateCcw,
      phase: "Inventory & Cost Control",
      title: "To Inventory",
      desc: "Every item sold deducts ingredients, tracks waste, and updates cost data—without manual stock edits.",
      highlight: "Zero Manual Edits",
      annotations: ["Auto-deduction", "Cost tracking"],
    },
    {
      icon: BarChart3,
      phase: "Reporting & Oversight",
      title: "To Analytics",
      desc: "Sales, margins, staff activity, and stock movement are always up to date—no end-of-day surprises.",
      highlight: "Live Data",
      annotations: ["Real-time insights", "Margin tracking"],
    },
  ];

  return (
    <section className="relative py-32 bg-slate-950 overflow-hidden" id="flow">
      {/* Background Circuit Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#FFF_1px,transparent_1px),linear-gradient(to_bottom,#FFF_1px,transparent_1px)] bg-size-[60px_60px]" />

      <div className="container relative z-10 px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-20 mx-auto text-center md:text-left md:mx-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start gap-4"
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full">
              <Zap size={14} className="text-accent fill-accent" />
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-accent">
                Reliability by Design
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]">
              One Continuous <br />
              <span className="text-accent underline decoration-8 -underline-offset-4 decoration-accent/10">
                Operational Flow, On Any Device, Even Without Internet.
              </span>
            </h2>

            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mt-4">
              No gaps. No sync issues. No downtime when connectivity fails.
            </p>
          </motion.div>
        </div>

        {/* Flow Steps */}
        <div className="relative z-10 flex flex-col items-center gap-24 md:gap-32 w-full">
          {steps.map((step, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="flex flex-col items-center text-center w-full group"
              >
                {/* Phase + Title + Description */}
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-accent/60 mb-4 block">
                  {step.phase}
                </span>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed text-base md:text-lg max-w-2xl mb-10">
                  {step.desc}
                </p>

                {/* App Window Showcase */}
                <div className="relative w-full max-w-5xl mx-auto">
                  {/* Ambient Glow Behind */}
                  <div
                    className="absolute -inset-8 md:-inset-16 rounded-[40px] blur-2xl opacity-50 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, ${glowColors[i]}, transparent 70%)`,
                    }}
                  />

                  {/* The App Window */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10"
                    style={{ perspective: "1200px" }}
                  >
                    <div
                      className="relative rounded-2xl overflow-hidden border transition-all duration-500"
                      style={{
                        transform: "rotateX(4deg)",
                        transformOrigin: "center bottom",
                        borderColor: borderGlowColors[i],
                        boxShadow: `0 30px 60px -15px ${glowColors[i]}, 0 15px 30px -10px rgba(0,0,0,0.4)`,
                      }}
                    >
                      {/* Window Title Bar */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex-1 flex justify-center">
                          <div className="px-4 py-1 rounded-md bg-slate-800/60 text-[11px] text-slate-500 font-medium tracking-wide">
                            codeket.app — {step.phase}
                          </div>
                        </div>
                        <div className="w-[52px]" /> {/* Spacer for symmetry */}
                      </div>

                      {/* Screenshot */}
                      <div className="relative aspect-video bg-slate-900">
                        <img
                          src={images[i].src}
                          alt={images[i].alt}
                          className="w-full h-full object-cover object-top"
                        />

                        {/* Very subtle bottom fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-950/50 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Annotation Badges */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="absolute -left-4 md:-left-8 top-1/3 z-20 hidden md:block"
                  >
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: borderGlowColors[i].replace(
                              "0.3",
                              "1",
                            ),
                          }}
                        />
                        <span className="text-xs font-bold text-slate-200 tracking-wide whitespace-nowrap">
                          {step.annotations[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute -right-4 md:-right-8 top-2/3 z-20 hidden md:block"
                  >
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: borderGlowColors[i].replace(
                              "0.3",
                              "1",
                            ),
                          }}
                        />
                        <span className="text-xs font-bold text-slate-200 tracking-wide whitespace-nowrap">
                          {step.annotations[1]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Highlight Badge below image */}
                <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: borderGlowColors[i].replace("0.3", "1"),
                    }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    {step.highlight}
                  </span>
                </div>

                {/* Connector to next step */}
                {i < steps.length - 1 && (
                  <div className="mt-8 w-[2px] h-16 bg-linear-to-b from-slate-700 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Closing Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-12 border-t border-slate-900 text-center md:text-left"
        >
          <p className="text-xl md:text-2xl text-slate-300 font-black tracking-tight leading-relaxed max-w-4xl">
            A single action in Codeket triggers every downstream effect
            automatically—orders, kitchen flow, stock, and reporting stay in
            sync by design.
          </p>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((x) => (
                  <div
                    key={x}
                    className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center"
                  >
                    <Smartphone size={16} className="text-slate-500" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Built by operators for{" "}
                <span className="text-white font-bold">mission-critical</span>{" "}
                environments.
              </p>
            </div>

            <a
              href="#pricing"
              className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest group hover:text-accent transition-colors no-underline"
            >
              Get Started
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
