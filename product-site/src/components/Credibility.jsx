import { motion } from "framer-motion";
import { ShieldCheck, Zap, WifiOff, Clock } from "lucide-react";

export default function Credibility() {
  const points = [
    {
      icon: ShieldCheck,
      title: "Built for pressure",
      desc: "Designed for high-volume service environments, not just simple retail demos.",
    },
    {
      icon: WifiOff,
      title: "Offline-capable",
      desc: "Your restaurant doesn't stop when the internet does. Syncs automatically when back online.",
    },
    {
      icon: Clock,
      title: "Reliable Uptime",
      desc: "99.99% infrastructure uptime with redundant failover systems.",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      desc: "Go live in hours, not weeks. No contractor visits or cabling required.",
    },
  ];

  return (
    <section className="section bg-white py-24">
      <div className="container">
        <div className="bg-[--color-text-primary] rounded-[40px] p-12 md:p-20 relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10">
            <div className="mb-12">
              <span className="inline-flex font-mono text-[0.7rem] uppercase tracking-widest px-3.5 py-1.5 rounded-full text-accent bg-accent/10 font-extrabold border border-accent/20">
                The Reliability Engine
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4 tracking-tight">
                Designed for high-volume, <br /> mission-critical service.
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                Codeket isn't just a POS; it's industrial-grade infrastructure
                that protects your revenue when it matters most.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {points.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-start gap-4"
                >
                  <div className="text-accent">
                    <point.icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-white text-lg font-extrabold tracking-tight">
                    {point.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {point.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
