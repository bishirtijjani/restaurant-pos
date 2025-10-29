// frontend/src/features/home/components/Platforms.jsx
import React from "react";
import { Check, Globe, Smartphone, Monitor, Tablet } from "lucide-react";

const platforms = [
  {
    title: "Web Dashboard",
    icon: Globe,
    description: "Powerful web-based management",
    features: [
      "Real-time monitoring",
      "Advanced reporting",
      "Multi-location view",
    ],
  },
  {
    title: "Mobile POS",
    icon: Smartphone,
    description: "iOS and Android POS apps",
    features: ["Tableside ordering", "Offline mode", "Payment processing"],
  },
  {
    title: "Kitchen Display",
    icon: Monitor,
    description: "Digital kitchen screens",
    features: ["Order tracking", "Prep timers", "Recipe display"],
  },
  {
    title: "Tablet POS",
    icon: Tablet,
    description: "Optimized for tablets",
    features: ["Touch-friendly", "Fast checkout", "Server stations"],
  },
];

export default function PlatformsSection() {
  return (
    <div
      className="py-20 bg-gradient-to-b from-base-100 to-base-200 relative overflow-hidden"
      id="platforms"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <Monitor className="w-4 h-4" />
            Multi-Platform Ready
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-base-content">
            Run Your Restaurant
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Anywhere, Anytime
            </span>
          </h2>

          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            From front-of-house tablets to kitchen displays and back-office
            management, our system works seamlessly across all your devices.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="group relative bg-base-100/60 backdrop-blur-xl border border-base-content/10 p-6 lg:p-8 rounded-2xl text-center hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Icon with animated background */}
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-110"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-3 lg:p-4 rounded-2xl border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                  <platform.icon className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg lg:text-2xl mb-2 lg:mb-3 text-base-content group-hover:text-primary transition-colors duration-300">
                {platform.title}
              </h3>

              <p className="text-sm lg:text-base text-base-content/70 mb-4 lg:mb-6 leading-relaxed">
                {platform.description}
              </p>

              {/* Features List */}
              <div className="space-y-2 lg:space-y-3">
                {platform.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-left gap-2 lg:gap-3 text-xs lg:text-sm text-base-content/80 group-hover:text-base-content transition-colors duration-300"
                  >
                    <div className="bg-success/20 p-1 rounded-full flex-shrink-0">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    <span className="font-medium text-left">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Floating accent */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-primary to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-base-100/60 backdrop-blur-xl border border-base-content/10 px-6 lg:px-8 py-4 rounded-full">
            <span className="text-sm lg:text-base text-base-content/70 text-center sm:text-left">
              Experience seamless restaurant management across all devices
            </span>
            <button className="btn btn-primary btn-sm lg:btn-md whitespace-nowrap">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
