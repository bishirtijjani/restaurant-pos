// frontend/src/features/home/components/Guarantee.jsx
import React from "react";
import { Shield, Clock, TrendingUp, Headphones } from "lucide-react";

const Guarantee = () => {
  const guarantees = [
    {
      icon: Clock,
      title: "14-Day Free Trial",
      description: "Full access, no credit card required",
    },
    {
      icon: TrendingUp,
      title: "30-Day ROI Guarantee",
      description: "See results or get your money back",
    },
    {
      icon: Shield,
      title: "99.9% Uptime",
      description: "Your restaurant runs 24/7, so do we",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert help whenever you need it",
    },
  ];

  return (
    <div
      className="py-16 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 relative overflow-hidden"
      id="guarantee"
    >
      <div className="container mx-auto px-6 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-base-content mb-3">
            Our Promise to
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Restaurant Owners
            </span>
          </h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            We're confident our system will transform your restaurant
            operations. That's why we back it with these guarantees.
          </p>
        </div>

        {/* Guarantees Grid - Compact Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <div
              key={index}
              className="group text-center p-6 bg-base-100/60 backdrop-blur-xl border border-base-content/10 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-2xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300 mx-auto w-fit mb-4">
                <guarantee.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg text-base-content mb-2 group-hover:text-primary transition-colors duration-300">
                {guarantee.title}
              </h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>

        {/* Single CTA - Compact */}
        <div className="text-center mt-12">
          <button className="btn btn-primary btn-lg">
            Start Your Risk-Free Trial
          </button>
          <p className="text-xs text-base-content/60 mt-2">
            Join 500+ restaurants already running more efficiently
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guarantee;
