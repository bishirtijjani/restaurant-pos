import { motion } from "framer-motion";
import { ClipboardList, PackageCheck, TrendingUp, Map } from "lucide-react";

export default function OperationalFlow() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Order",
      desc: "Waiters tap. Kitchen sees. Chaos ends.",
    },
    {
      icon: PackageCheck,
      title: "Stock",
      desc: "Recipes deduct from inventory automatically.",
    },
    {
      icon: TrendingUp,
      title: "Profit",
      desc: "Real costs. Real margins. Real time.",
    },
    {
      icon: Map,
      title: "Scale",
      desc: "Push menu updates to 100 stores.",
    },
  ];

  return (
    <section className="section bg-white text-center py-24" id="flow">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16">
          <div className="mb-4">
            <span className="badge">Engineered Efficiency</span>
          </div>
          <h2 className="mb-4 font-extrabold tracking-tight text-[--color-text-primary] text-4xl">
            Unified Velocity.
          </h2>
          <p className="mx-auto text-gray-500 text-lg max-w-[500px] leading-relaxed">
            One continuous circuit. No manual data entry.
          </p>
        </div>

        <div className="relative max-w-[1000px] mx-auto">
          {/* The Track (Desktop only) */}
          <div className="hidden md:block absolute top-[50px] left-[10%] right-[10%] h-px bg-gray-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Node */}
                <motion.div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-white border border-gray-200 shadow-md transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
                  <div className="text-[--color-text-primary]">
                    <step.icon size={30} strokeWidth={2} />
                  </div>
                </motion.div>

                <h3 className="text-xl mb-2 font-extrabold text-[--color-text-primary]">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed max-w-[180px] mx-auto font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
