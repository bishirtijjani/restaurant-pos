import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const appUrl = "https://app.restaurant.codeket.com";

    window.location.href = `${appUrl}/register?email=${encodeURIComponent(
      email,
    )}`;
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-white">
      <div className="container">
        {/* Text Content - Top Section */}
        <div className="max-w-3xl mx-auto text-center mb-26 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black mb-6 tracking-tighter leading-[1.05] text-[--color-text-primary]">
              Run TESTEDed Your Restaurant on One{" "}
              <span className="text-accent underline decoration-8 underline-offset-[-4px] decoration-accent/10">
                Operational System
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-medium max-w-2xl mx-auto">
              Offline-capable restaurant management built for real-world
              conditions. From POS to KDS, inventory to analytics.
            </p>

            <div className="flex items-center justify-center gap-3 py-2 px-4 bg-orange-50 border border-orange-100 rounded-xl mb-10 w-fit mx-auto">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[0.7rem] font-black uppercase tracking-widest text-orange-900">
                Early Access — Limited UK Restaurants
              </span>
            </div>

            {/* Email CTA */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white border-2 border-gray-400 rounded-2xl shadow-xl hover:border-gray-300 transition-all mb-8 group focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/5 w-full sm:max-w-[540px] mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your work email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-4 rounded-xl text-[--color-text-primary] font-semibold outline-none bg-transparent placeholder:text-gray-400 placeholder:font-medium text-sm"
              />
              <button
                type="submit"
                className="bg-accent text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-[0.98] whitespace-nowrap"
              >
                Get Started
                <ArrowRight size={16} strokeWidth={3} />
              </button>
            </form>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-accent" />
                No Credit Card
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-accent" />
                14-Day Trial
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-accent" />
                Works Offline
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Large 3D Dashboard - Bottom Section (Refined Full Width) */}
      <div className="relative w-full perspective-[1000px] md:perspective-[2000px] -mt-12 md:-mt-20">
        <motion.div
          initial={{
            rotateX: 0,
            rotateY: 20,
            rotateZ: -15,
            opacity: 0,
            y: 50,
            scale: 0.9,
          }}
          animate={{
            rotateX: 0,
            rotateY: 20,
            rotateZ: -15,
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full flex items-start justify-center origin-top"
        >
          {/* Main Dashboard - Spans Full Width with Breathing Room */}
          <div className="relative w-full max-w-[1600px] mx-auto rounded-2xl md:rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
            <img
              src="/assets/dashboard.png"
              alt="Restaurant Management Dashboard"
              className="w-full h-auto rounded-2xl md:rounded-3xl border border-gray-200"
            />
          </div>

          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/10 blur-[60px] md:blur-[120px] -z-10 transform translate-y-20" />
        </motion.div>
      </div>
    </section>
  );
}
