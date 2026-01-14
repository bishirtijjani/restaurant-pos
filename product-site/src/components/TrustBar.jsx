export default function TrustBar() {
  const points = [
    { name: "Offline-first" },
    { name: "•" },
    { name: "Any-device" },
    { name: "•" },
    { name: "Granular tax logic" },
    { name: "•" },
    { name: "No hardware lock-in" },
  ];

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
        <div className="flex flex-col items-center gap-10">
          {/* Header Text - Kept in center container */}
          <div className="container px-8">
            <h2 className="font-bold uppercase tracking-[0.2em] text-white text-center drop-shadow-lg text-base md:text-xl">
              Designed for real-world restaurant constraints
            </h2>
          </div>

          {/* Static Points Container */}
          <div className="container px-8">
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 grayscale brightness-200 contrast-125 opacity-70 hover:opacity-100 transition-opacity duration-500">
              {points.map((point, i) => (
                <div
                  key={i}
                  className={`text-xl md:text-2xl font-black tracking-tighter text-white select-none ${
                    point.name === "•"
                      ? "text-accent opacity-50 hidden md:block"
                      : ""
                  }`}
                >
                  {point.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
