import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  WifiOff,
  Clock,
  Server,
  MonitorCheck,
  ArrowRight,
} from "lucide-react";

export default function Credibility() {
  const points = [
    {
      icon: ShieldCheck,
      title: "Built for pressure",
      desc: "Designed for high-volume service environments, not just simple retail demos.",
      feature: "Industrial Grade",
    },
    {
      icon: WifiOff,
      title: "Offline-capable",
      desc: "Your restaurant doesn't stop when the internet does. Syncs automatically when back online.",
      feature: "Local-First",
    },
    {
      icon: Clock,
      title: "Reliable Uptime",
      desc: "99.99% infrastructure uptime with redundant failover systems across multiple regions.",
      feature: "High Availability",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      desc: "Go live in hours, not weeks. No contractor visits or proprietary cabling required.",
      feature: "Agile Deployment",
    },
  ];

  return (
    <section className="relative py-20 bg-[#F9FAFB] overflow-hidden">
      {/* Background Technical Grid Accent */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative z-10 px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start gap-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Designed for high-volume, <br />
              <span className="text-accent">mission-critical</span> service.
            </h2>

            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              Codeket isn't just a POS; it's industrial-grade infrastructure
              that protects your revenue when it matters most.
            </p>
          </motion.div>
        </div>

        {/* Reliability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-white border border-slate-200 rounded-[32px] p-10 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
            >
              {/* Card Accent Top Bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-100 group-hover:bg-accent group-hover:w-24 transition-all duration-500 rounded-b-full" />

              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-accent group-hover:text-white transition-colors duration-500 border border-slate-100 shadow-sm">
                    <point.icon size={32} strokeWidth={2} />
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 group-hover:text-accent transition-colors">
                    {point.feature}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight group-hover:translate-x-1 transition-transform">
                    {point.title}
                  </h3>
                </div>

                <p className="text-slate-500 font-medium leading-[1.6] text-[0.95rem]">
                  {point.desc}
                </p>

                {/* Technical status indicator */}
                <div className="mt-auto pt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                  <MonitorCheck size={14} className="text-emerald-500" />
                  <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
                    Verified Secure
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Proof HUD */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 group hover:border-accent/40 transition-all duration-700 overflow-hidden relative"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-colors" />

          <div className="flex-1 flex flex-col md:flex-row items-center gap-10">
            <div className="text-center md:text-left">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">
                99.99%
              </div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Global Infra Uptime
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-slate-100" />

            <div className="text-center md:text-left">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">
                &lt; 50ms
              </div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                API Latency
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-slate-100" />

            <div className="text-center md:text-left">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">
                256-bit
              </div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                End-to-End Encryption
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <button className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group/btn">
              View Security Whitepaper
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
