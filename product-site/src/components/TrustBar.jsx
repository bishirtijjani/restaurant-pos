import { motion } from "framer-motion";

export default function TrustBar() {
  const logos = [
    { name: "GlobalBistro", style: "italic" },
    { name: "UrbanDine", style: "normal" },
    { name: "MetroEats", style: "normal" },
    { name: "SavorGroup", style: "italic" },
    { name: "CafeLux", style: "normal" },
    { name: "PrimePlate", style: "italic" },
    { name: "UrbanGrill", style: "normal" },
    { name: "SkyDining", style: "italic" },
  ];

  // Quadruple logos to ensure seamless marquee on ultra-wide screens
  const marqueeLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative bg-black py-20 overflow-hidden border-y border-white/5">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 mix-blend-multiply"
        >
          <source
            src="/assets/brands-banner.mp4"
            type="video/mp4"
            autoPlay
            audio="false"
          />
        </video>
        {/* Dark Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-transparent to-gray-950/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col items-center gap-12">
          {/* Header Text - Kept in center container */}
          <div className="container px-8">
            <h2 className="font-bold uppercase tracking-[0.2em] text-white text-center drop-shadow-lg">
              Trusted by modern operators worldwide
            </h2>
          </div>

          {/* Infinite Marquee Container - FULL WIDTH WINDOW BLEED + Faded Edges */}
          <div
            className="relative w-full overflow-hidden flex grayscale brightness-200 contrast-125 opacity-70 hover:opacity-100 transition-opacity duration-500"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <div className="flex animate-marquee-infinite whitespace-nowrap items-center py-2">
              {marqueeLogos.map((logo, i) => (
                <div
                  key={i}
                  className={`mx-12 text-2xl md:text-3xl font-black tracking-tighter text-white select-none ${
                    logo.style === "italic" ? "italic" : ""
                  }`}
                >
                  {logo.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); } 
        }
        .animate-marquee-infinite {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
