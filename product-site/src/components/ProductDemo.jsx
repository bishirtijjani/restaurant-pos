import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function ProductDemo() {
  return (
    <section className="section bg-white overflow-hidden py-32" id="demo">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="mb-4">
              <span className="badge">Interface Insight</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[--color-text-primary] leading-none">
              Built for speed, <br /> not for training.
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed font-medium">
              We ditched the complex menus. Every mission-critical action is
              exactly one tap away. Your staff will be experts in 15 minutes.
            </p>
            <div className="space-y-4">
              {[
                "Zero-lag order input",
                "Split-second payments",
                "Live kitchen status feedback",
                "Instant search for 1000+ SKUs",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-[--color-text-primary] font-bold"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-950 aspect-[16/10] bg-gray-900 group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-60 mix-blend-overlay" />

              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 group-hover:bg-white group-hover:text-accent">
                  <Play size={32} fill="currentColor" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-bold uppercase tracking-widest opacity-80">
                  Watch: The 60-Second Rush
                </p>
              </div>
            </motion.div>

            {/* Float Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-white border border-gray-200 p-4 px-6 rounded-2xl shadow-xl hidden md:block"
            >
              <div className="text-2xl font-black text-accent">0.2s</div>
              <div className="text-[0.6rem] font-bold uppercase text-gray-400 tracking-tighter">
                Latency on order push
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
