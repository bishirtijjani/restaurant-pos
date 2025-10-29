// frontend/src/features/home/components/Features.jsx
import React from "react";
import {
  BarChart3,
  UtensilsCrossed,
  Users,
  Zap,
  ShoppingCart,
  Clock,
  Smartphone,
  Package,
  DollarSign,
  ChefHat,
  FileText,
  Settings,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Order Management",
      description:
        "Process dine-in, takeout, and delivery orders seamlessly with real-time order tracking.",
      icon: ShoppingCart,
    },
    {
      title: "Kitchen Display System",
      description:
        "Digital kitchen screens that sync orders instantly, reducing errors and wait times.",
      icon: ChefHat,
    },
    {
      title: "Table Management",
      description:
        "Visual floor plans, table status tracking, and reservation management in one place.",
      icon: UtensilsCrossed,
    },
    {
      title: "Menu Management",
      description:
        "Easy menu updates, pricing control, ingredient tracking, and modifier management.",
      icon: FileText,
    },
    {
      title: "Inventory Control",
      description:
        "Track ingredients, get low-stock alerts, and automate reordering to prevent waste.",
      icon: Package,
    },
    {
      title: "Staff Management",
      description:
        "Schedule shifts, track attendance, manage roles, and monitor performance metrics.",
      icon: Users,
    },
    {
      title: "Sales Analytics",
      description:
        "Real-time reports on sales, popular items, peak hours, and revenue trends.",
      icon: BarChart3,
    },
    {
      title: "Payment Processing",
      description:
        "Accept cash, cards, and mobile payments with split bills and tip management.",
      icon: DollarSign,
    },
    {
      title: "Customer Management",
      description:
        "Build customer profiles, track preferences, and run loyalty programs.",
      icon: Users,
    },
    {
      title: "Multi-Location Support",
      description:
        "Manage multiple restaurant locations from one central dashboard.",
      icon: Settings,
    },
    {
      title: "Quick Service Mode",
      description:
        "Fast-paced ordering interface perfect for quick-service restaurants.",
      icon: Zap,
    },
    {
      title: "Mobile POS",
      description:
        "Take orders tableside with tablets and smartphones for faster service.",
      icon: Smartphone,
    },
  ];

  return (
    <div
      className="py-20 bg-gradient-to-b from-base-200 to-base-100 relative overflow-hidden"
      id="features"
    >
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/3 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-accent/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <UtensilsCrossed className="w-4 h-4" />
            Complete Solution
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-base-content">
            Everything You Need to
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Run Your Restaurant
            </span>
          </h2>

          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            From front-of-house to back-of-house operations, streamline every
            aspect of your restaurant with one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-base-100/70 backdrop-blur-xl border border-base-content/10 p-6 lg:p-8 rounded-2xl text-center hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-3"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-base to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>

              {/* Icon container with floating animation */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-110"></div>
                <div className="relative bg-gradient-to-br from-base-100 to-base-300 p-5 rounded-2xl border border-primary/10 group-hover:border-primary/30 transition-all duration-300 ">
                  <feature.icon className="mx-auto h-10 w-10 text-primary group-hover:scale-125  transition-all duration-300" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-xl mb-4 text-base-content group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-base-content/70 leading-relaxed group-hover:text-base-content/90 transition-colors duration-300 text-sm">
                {feature.description}
              </p>

              {/* Floating corner accent */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>

              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-3/4 transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-12 lg:mt-20">
          <div className="bg-base-100/60 backdrop-blur-xl border border-base-content/10 rounded-3xl p-6 lg:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl lg:text-2xl font-bold text-base-content mb-3 lg:mb-4">
              Ready to Transform Your Restaurant?
            </h3>
            <p className="text-sm lg:text-base text-base-content/70 mb-4 lg:mb-6">
              Join hundreds of restaurants that have streamlined operations and
              increased profits with our system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button className="btn btn-primary btn-md lg:btn-lg">
                Start Free Trial
              </button>
              <button className="btn btn-outline btn-md lg:btn-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
