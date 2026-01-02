import React from "react";
import { Link } from "react-router-dom";
import { BoltIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const FirstOrderWidget = () => {
  return (
    <div className="card bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl border border-white/10 mb-8 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />

      <div className="card-body relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/30 text-brand text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            System Ready
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Your workspace is live.
            <br />
            <span className="text-white/60">Time to make your first sale.</span>
          </h2>
          <p className="text-white/40 font-medium">
            The onboarding simulation is complete. Launch the actual Point of
            Sale to process real revenue.
          </p>
        </div>

        <Link
          to="/app/pos"
          className="group relative px-8 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3 shrink-0"
        >
          Open POS
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
        </Link>
      </div>

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
};

export default FirstOrderWidget;
