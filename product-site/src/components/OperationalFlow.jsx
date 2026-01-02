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
  const steps = [
    {
      icon: Smartphone,
      phase: "Orders & Service Execution",
      title: "The Floor",
      desc: "Orders are created once and flow through tables, counters, and devices without duplication or resync.",
      highlight: "No Duplication",
    },
    {
      icon: ChefHat,
      phase: "Kitchen & Preparation Flow",
      title: "The Line",
      desc: "Orders route automatically to the correct stations with timing, notes, and status updates in real time.",
      highlight: "Real-Time Sync",
    },
    {
      icon: RotateCcw,
      phase: "Inventory & Cost Control",
      title: "The Vault",
      desc: "Every item sold deducts ingredients, tracks waste, and updates cost data—without manual stock edits.",
      highlight: "Zero Manual Edits",
    },
    {
      icon: BarChart3,
      phase: "Reporting & Oversight",
      title: "Progress",
      desc: "Sales, margins, staff activity, and stock movement are always up to date—no end-of-day surprises.",
      highlight: "Oversight",
    },
  ];

  return (
    <section className="relative py-32 bg-slate-950 overflow-hidden" id="flow">
      {/* Background Circuit Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#FFF_1px,transparent_1px),linear-gradient(to_bottom,#FFF_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container relative z-10 px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start gap-4"
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full">
              <Zap size={14} className="text-accent fill-accent" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-accent">
                Reliability by Design
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]">
              One Continuous <br />
              <span className="text-accent underline decoration-8 underline-offset-[-4px] decoration-accent/10">
                Operational Flow.
              </span>
            </h2>

            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mt-4">
              No gaps. No sync issues. No manual reconciliation.
            </p>
          </motion.div>
        </div>

        {/* The Circuit Flow */}
        <div className="relative">
          {/* Desktop Connection Path (SVG) */}
          <div className="absolute top-[80px] left-[5%] right-[5%] hidden lg:block h-[2px] z-0">
            <svg
              width="100%"
              height="2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1H1000"
                stroke="url(#circuit-gradient)"
                strokeWidth="2"
                strokeDasharray="8 12"
              />
              <defs>
                <linearGradient
                  id="circuit-gradient"
                  x1="0"
                  y1="1"
                  x2="1000"
                  y2="1"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FF6B35" stopOpacity="0" />
                  <stop offset="0.2" stopColor="#FF6B35" />
                  <stop offset="0.8" stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#FF6B35" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            {/* Pulsing Data Packet */}
            <motion.div
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_10px_#FF6B35]"
            />
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="flex flex-col items-start group"
              >
                {/* Node Milestone */}
                <div className="relative mb-10 self-center lg:self-start">
                  <div className="w-20 h-20 rounded-[24px] bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-white group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500 shadow-2xl group-hover:shadow-accent/20 relative z-10 overflow-hidden">
                    <step.icon
                      size={32}
                      strokeWidth={1.5}
                      className="group-hover:text-accent transition-colors"
                    />
                    {/* Inner Tech Accent */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_center,#FF6B35_0%,transparent_70%)] transition-opacity" />
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[0.65rem] font-black text-slate-400 group-hover:text-white group-hover:border-accent transition-all z-20">
                    0{i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center lg:text-left">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent/60 mb-2 block">
                    {step.phase}
                  </span>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <div className="h-0.5 w-12 bg-slate-800 group-hover:w-full group-hover:bg-accent/30 transition-all duration-500 mb-6 mx-auto lg:mx-0" />
                  <p className="text-slate-400 font-medium leading-relaxed text-sm">
                    {step.desc}
                  </p>

                  {/* Highlight Badge */}
                  <div className="mt-8 pt-6 border-t border-slate-900 flex items-center justify-center lg:justify-start gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-300">
                      {step.highlight}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

            <button className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest group hover:text-accent transition-colors">
              Explore System Architecture
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
