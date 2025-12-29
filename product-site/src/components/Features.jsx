import { motion } from "framer-motion";
import { Server, DollarSign, Layers, Lock } from "lucide-react";

export default function Features() {
  const pillars = [
    {
      title: "Core Operations",
      subtitle: "Performance",
      desc: "Instant orders. Unified payments. KDS routing. The engine that never stops.",
      icon: Server,
      accent: "text-orange-500",
      bg: "bg-orange-50",
      borderColor: "hover:border-orange-500",
    },
    {
      title: "Cost Control",
      subtitle: "Margins",
      desc: "Live inventory deduction. Supplier tracking. Waste logs. Stop bleeding cash.",
      icon: DollarSign,
      accent: "text-emerald-500",
      bg: "bg-emerald-50",
      borderColor: "hover:border-emerald-500",
    },
    {
      title: "Compliance",
      subtitle: "Risk MGMT",
      desc: "Automated tax reports. Shift logs. End-of-day reconciliation. Sleep easy.",
      icon: Lock,
      accent: "text-blue-500",
      bg: "bg-blue-50",
      borderColor: "hover:border-blue-500",
    },
    {
      title: "Multi-Location",
      subtitle: "Expansion",
      desc: "Push one menu to 50 stores. See global sales in real-time. Scale fast.",
      icon: Layers,
      accent: "text-violet-500",
      bg: "bg-violet-50",
      borderColor: "hover:border-violet-500",
    },
  ];

  return (
    <section
      className="section bg-gray-50 border-t border-b border-gray-200"
      id="features"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="badge">Total Coverage</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight text-[--color-text-primary]">
            Everything you need.
          </h2>
          <p className="mx-auto text-gray-500 max-w-[600px] text-lg leading-relaxed">
            We give you total command over the operational variables that make
            or break a restaurant business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card flex flex-col items-start text-left group transition-all duration-300 ${pillar.borderColor}`}
              whileHover={{
                y: -6,
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                className={`inline-flex p-2.5 ${pillar.bg} rounded-xl ${pillar.accent} mb-6 transition-transform group-hover:scale-110`}
              >
                <pillar.icon size={26} strokeWidth={2} />
              </div>

              <div className="text-[0.7rem] uppercase tracking-widest text-gray-400 mb-1 font-extrabold">
                {pillar.subtitle}
              </div>

              <h3 className="text-xl font-extrabold mb-4 text-[--color-text-primary]">
                {pillar.title}
              </h3>

              <p className="text-gray-500 leading-relaxed text-[0.95rem] m-0">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
