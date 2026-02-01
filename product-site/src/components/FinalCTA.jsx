import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export default function FinalCTA({ onContactClick }) {
  const benefits = [
    "14-Day Free Trial",
    "No Credit Card Required",
    "Setup in 15 Minutes",
    "Direct Founder Support",
    "Use iPad, Android, or Any Browser",
    "No £799–£3,000 Hardware Purchase",
  ];

  return (
    <section className="section bg-white pb-32">
      <div className="container">
        <div className="bg-gray-950 rounded-[40px] p-8 md:p-20 relative overflow-hidden text-center shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,53,0.15)_0%,transparent_70%)] z-0" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
              Start your <br className="md:hidden" />
              <span className="text-accent underline decoration-4 underline-offset-8">
                operations-first
              </span>{" "}
              era.
            </h2>

            <p className="text-gray-400 text-xl mb-12 font-medium">
              Join restaurants taking control of their operations — even in
              unreliable internet environments.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <a
                href="https://app.restaurant.codeket.com/register"
                className="btn btn-primary px-12 py-5 text-xl tracking-tight"
              >
                Claim Your Free Trial
                <ArrowRight size={24} className="ml-2" />
              </a>
              <button
                onClick={onContactClick}
                className="bg-transparent border-2 border-white/20 text-white rounded-full px-12 py-5 font-bold hover:bg-white/5 transition-all no-underline inline-block cursor-pointer"
              >
                Talk to a Human
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-gray-400 text-sm font-inter font-bold uppercase tracking-widest"
                >
                  <Check size={16} className="text-accent stroke-[3px]" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
