import { motion } from "framer-motion";
import { Sparkles, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";

export default function FoundingPartners() {
  return (
    <section
      className="relative py-24 bg-slate-900 overflow-hidden"
      id="founding-partners"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-transparent border border-accent/20 rounded-full mb-8"
            >
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                UAE Launch Program
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-8"
            >
              UAE Early Access: <br />
              <span className="text-accent">Founding Restaurants</span> Wanted
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 font-medium leading-relaxed mb-10 max-w-xl"
            >
              Codeket Restaurant is entering live restaurant environments in the
              UAE for the first time. Founding Partners get early access, direct
              influence on features, and locked-in pricing — in exchange for
              real-world usage and feedback.
            </motion.p>

            <div className="flex flex-col gap-4 text-gray-300 font-medium hover:text-white transition-colors">
              {[
                "Direct Access to the Founder (Personal Cell)",
                "Lifetime Price Lock (AED 599/mo)",
                "Feature Priority (You ask, we build)",
                "Zero Setup Fees (AED 2,000 value)",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full max-w-md relative"
          >
            {/* Card Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-orange-600 rounded-[3rem] blur-xl opacity-20 transform translate-y-4" />

            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={140} className="text-white" />
              </div>

              <div className="relative z-10">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Spots Remaining
                </div>
                <div className="text-7xl font-black text-white mb-2 tracking-tighter">
                  06
                  <span className="text-2xl text-gray-500 font-bold ml-2">
                    / 06
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full mb-10 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "10%" }} // Just started
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>

                <a
                  href="https://wa.me/2349063503232"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full p-6 bg-accent hover:bg-orange-500 text-white rounded-2xl transition-all shadow-lg shadow-accent/20 cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-80 mb-1">
                      Apply Now
                    </span>
                    <span className="text-lg font-bold">Claim a Spot</span>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-colors">
                    <ArrowRight size={24} />
                  </div>
                </a>

                <p className="mt-6 text-center text-[0.7rem] text-gray-500 font-medium">
                  No commitment required to apply.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
