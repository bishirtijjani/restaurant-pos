import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission logic here
    console.log("Email submitted:", email);
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
                Unified Velocity for <br className="hidden md:block" />
                <span className="text-accent underline decoration-8 underline-offset-[-2px] decoration-accent/10">
                  Modern
                </span>{" "}
                Restaurants.
              </h1>

              <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                Codeket Restaurant is an operations-first restaurant management
                system that replaces disconnected POS systems, spreadsheets, and
                manual stock tracking with one reliable platform for sales,
                inventory, and reporting.
              </p>

              {/* Email CTA */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white border-2 border-gray-100 rounded-2xl shadow-lg hover:border-gray-200 transition-all mb-10 group focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/5 max-w-[540px]"
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
          <div className="flex-1 w-full lg:max-w-[600px] xl:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-[16/10] bg-gray-950 rounded-[40px] shadow-2xl overflow-hidden border-8 border-white group"
            >
              {/* Product Video Frame */}
              <div className="absolute inset-0">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                >
                  {/* Using a high-quality clean restaurant demo placeholder */}
                  <source
                    src="https://cdn.pixabay.com/video/2021/08/21/85860-591321045_large.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>

              {/* Play Overlay (Decorative) */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none group-hover:bg-black/10 transition-colors">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-2xl scale-100 group-hover:scale-110 transition-transform">
                  <Play size={32} fill="white" className="ml-1" />
                </div>
              </div>

              {/* Interface Accents (Floating UI elements feel) */}
              <div className="absolute top-8 left-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-none hidden md:block">
                <div className="w-12 h-2 bg-accent/60 rounded-full mb-3" />
                <div className="w-24 h-2 bg-white/20 rounded-full" />
              </div>

              <div className="absolute bottom-8 right-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-none hidden md:block">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                </div>
              </div>
            </motion.div>

            {/* Floating Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-8 right-12 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden xl:block"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                  <Play size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-black text-[--color-text-primary]">
                    10.2s
                  </div>
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    Order-to-Kitchen Speed
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
