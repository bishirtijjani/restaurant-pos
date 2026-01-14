import { motion } from "framer-motion";
import {
  Smartphone,
  MessageCircle,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";

export default function Philosophy() {
  const pillars = [
    {
      icon: Smartphone,
      title: "Bring Your Own Hardware",
      description: "Your hardware should not be a business decision.",
      details:
        "Install Codeket on devices you already own — iPads, Android tablets, laptops, or desktops. No proprietary terminals. No forced upgrades. No hardware ransom.",
      tag: "Hardware Freedom",
    },
    {
      icon: MessageCircle,
      title: "Talk to Humans, Not Bots",
      description:
        "Need help? Text the founder directly. No tickets. No offshore wait times.",
      details:
        "Personalized support tier for every customer. We scale with your growth.",
      tag: "Direct Support",
    },
    {
      icon: Zap,
      title: "Process Over Customization",
      description:
        "We enforce proven workflows. Your 'special way' is often what's costing you money.",
      details:
        "One way to do things—the right way. Elimination of operational chaos by design.",
      tag: "Engineered Flow",
    },
    {
      icon: Target,
      title: "Strong Where It Matters",
      description:
        "POS, Inventory, Taxes, Reports — including complex, configurable tax rules. We don't waste time on marketing gimmicks.",
      details:
        "Built for the 90% of daily tasks that drive your bottom line. Industrial-grade focus.",
      tag: "Mission Critical",
    },
  ];

  return (
    <section className="section bg-white" id="philosophy">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="badge mb-6">Our Philosophy</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[--color-text-primary] leading-[1.1]">
              We're Opinionated <br /> By{" "}
              <span className="text-accent">Design.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-slate-500 font-medium leading-relaxed max-w-md lg:mb-2"
          >
            Built for serious restaurants that value operational continuity,
            reliability, and speed over cosmetic customization.
          </motion.p>
        </div>

        {/* Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-10 bg-slate-50 rounded-[40px] border border-slate-100 hover:border-accent/20 hover:bg-white hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle Corner Accent */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />

              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                    <pillar.icon size={32} strokeWidth={2} />
                  </div>
                  <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[--color-text-primary] mb-4 tracking-tight">
                  {pillar.title}
                </h3>

                <p className="text-lg font-bold text-slate-700 leading-snug mb-4">
                  {pillar.description}
                </p>

                <p className="text-slate-500 font-medium leading-relaxed text-[0.95rem]">
                  {pillar.details}
                </p>

                {/* Technical Indicator */}
                <div className="mt-auto pt-10 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-8 h-[1px] bg-accent" />
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-accent">
                    Operational Standard
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-1 bg-[--color-text-primary] rounded-[48px]"
        >
          <div className="bg-white rounded-[44px] p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[--color-text-primary]/10">
            <div className="max-w-xl">
              <h4 className="text-2xl font-black text-[--color-text-primary] mb-3">
                Does your current POS feel like a liability?
              </h4>
              <p className="text-slate-500 font-medium">
                Stop negotiating with software that doesn't respect your
                operations. Experience the Codeket standard today.
              </p>
            </div>

            <button className="btn btn-primary group">
              Start Your Migration
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
