import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, X, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const appUrl = "http://localhost:5173";
    window.location.href = `${appUrl}/register?email=${encodeURIComponent(
      email
    )}`;
  };

  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-32 overflow-hidden bg-white">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 z-0 hidden lg:block" />

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
          {/* Left Content Column */}
          <div className="flex-1 text-left max-w-[640px]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-8 tracking-tighter leading-[0.95] text-[--color-text-primary]">
                Run Your Restaurant
                <div className="m-0 p-0 gap-0 text-accent underline decoration-8 underline-offset-[-2px] decoration-accent/10">
                  on One Operational System.
                </div>
              </h1>

              <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                Codeket Restaurant is an operations-first restaurant management
                software that replaces disconnected POS systems, spreadsheets,
                and manual stock tracking with one reliable platform for sales,
                inventory, and reporting.
              </p>

              {/* Email CTA */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-row gap-2 p-1.5 bg-white border-2 border-gray-400 rounded-2xl shadow-lg hover:border-gray-200 transition-all mb-10 group focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/5 max-w-[540px]"
              >
                <input
                  type="email"
                  placeholder="Enter your work email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-xl text-[--color-text-primary] font-semibold outline-none bg-transparent placeholder:text-gray-400 placeholder:font-medium text-sm"
                />
                <button
                  type="submit"
                  className="bg-accent text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight size={16} strokeWidth={3} />
                </button>
              </form>

              {/* Trust Signal */}
              <div className="flex items-center gap-8 text-gray-400">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-accent" />
                  No Credit Card
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-accent" />
                  14-Day Free Trial
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Video Column */}
          <div className="flex-1 w-full lg:max-w-[600px] xl:max-w-none relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-[16/10] bg-gray-950 rounded-[40px] shadow-2xl overflow-hidden border-8 border-white group cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Product Video Frame (Background) */}
              <div className="absolute inset-0">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-60"
                >
                  <source src="/assets/brands-banner.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Play Overlay (The "Normal" Play Button) */}
              <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:bg-black/20 transition-colors">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-3 text-white border border-white/20 shadow-2xl scale-100 group-hover:scale-105 transition-all group/btn">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-accent transition-colors">
                    <Play
                      size={20}
                      fill="white"
                      className="ml-0.5 text-accent"
                    />
                  </div>
                  <span className="font-bold text-sm tracking-tight">
                    Watch Product Demo
                  </span>
                </div>
              </div>

              {/* Interface Accents (Decorative) */}
              <div className="absolute top-8 left-8 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-none hidden md:block">
                <div className="w-12 h-1.5 bg-accent/40 rounded-full mb-2" />
                <div className="w-20 h-1.5 bg-white/10 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Expansion Modal (Normal Video Behavior) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-8 lg:p-12 bg-gray-950/98 backdrop-blur-2xl"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                autoPlay
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain"
              >
                <source src="/assets/brands-banner.mp4" type="video/mp4" />
              </video>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-white/15 text-white rounded-full backdrop-blur-xl border border-white/10 transition-all z-[6000]"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
