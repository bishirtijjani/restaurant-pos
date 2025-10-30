// frontend/src/features/home/components/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Play,
  ArrowRight,
  UtensilsCrossed,
  ChefHat,
  TrendingUp,
  Stars,
} from "lucide-react";

export default function HeroSection() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100"
      id="home"
    >
      {/* Hero Content */}
      <div className="hero min-h-[calc(100vh-4rem)] px-4 py-8 lg:py-0">
        <div className="hero-content text-center w-full mt-6 lg:mt-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-left space-y-6 lg:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary font-bold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm backdrop-blur-sm border border-primary/30">
                <ChefHat className="w-3 h-3 lg:w-4 lg:h-4" />
                Built for Restaurant Success
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-base-content leading-tight text-center lg:tezt-left">
                Stop Losing Money to
                <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  {" "}
                  Restaurant Chaos
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg lg:text-xl text-base-content/80 leading-relaxed">
                Complete restaurant management system for cafes, quick-service
                restaurants, and full-service dining. Manage orders, inventory,
                staff, and customers from one powerful platform.
              </p>

              {/* Key Benefits */}
              <div className="flex flex-wrap gap-4 lg:gap-6 text-sm lg:text-base text-base-content/70">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
                  <span>Order management</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
                  <span>Kitchen display</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
                  <span>Sales analytics</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4">
                <Link
                  to="/login"
                  className="btn btn-primary sm:btn-md lg:btn-lg"
                >
                  Try Free Demo
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary sm:btn-md lg:btn-lg"
                >
                  Start Free Trial <Stars className="w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-6 lg:pt-8 border-t border-base-content/10">
                <p className="text-base-content/60 text-xs sm:text-sm mb-3 lg:mb-4">
                  Trusted by restaurants worldwide
                </p>
                <div className="flex flex-wrap items-center gap-4 lg:gap-8 opacity-60 text-sm lg:text-base">
                  <div className="text-base-content font-semibold">
                    Tasty Bites
                  </div>
                  <div className="text-base-content font-semibold">
                    Quick Grill
                  </div>
                  <div className="text-base-content font-semibold">
                    Café Delight
                  </div>
                  <div className="text-base-content font-semibold">
                    Fresh Eats
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative w-full mt-8 lg:mt-0">
              {/* Glassmorphism Container */}
              <div className="relative bg-base-100/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-base-content/20 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-error rounded-full"></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-warning rounded-full"></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-success rounded-full"></div>
                  </div>
                  <div className="text-base-content/70 text-xs lg:text-sm">
                    Restaurant Dashboard
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="bg-base-200/50 rounded-lg p-3 lg:p-4 border border-base-content/10">
                      <div className="text-primary text-xs lg:text-sm">
                        Today's Orders
                      </div>
                      <div className="text-base-content text-xl lg:text-2xl font-bold">
                        156
                      </div>
                      <div className="text-success text-xs">
                        +18% vs yesterday
                      </div>
                    </div>
                    <div className="bg-base-200/50 rounded-lg p-3 lg:p-4 border border-base-content/10">
                      <div className="text-primary text-xs lg:text-sm">
                        Revenue
                      </div>
                      <div className="text-base-content text-xl lg:text-2xl font-bold">
                        ₦485K
                      </div>
                      <div className="text-success text-xs">Peak hours</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-base-200/50 rounded-lg p-3 lg:p-4 border border-base-content/10 h-24 lg:h-32">
                    <div className="text-base-content/70 text-xs lg:text-sm mb-2">
                      Sales This Week
                    </div>
                    <div className="flex items-end gap-1 lg:gap-2 h-12 lg:h-16">
                      {[60, 80, 45, 90, 65, 95, 75].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-primary to-secondary rounded-sm flex-1"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="space-y-2">
                    <div className="text-base-content/70 text-xs lg:text-sm">
                      Active Orders
                    </div>
                    {[
                      "Table 7 - Burger Combo",
                      "Table 12 - Pasta Special",
                      "Takeout - Pizza Order",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-base-200/50 rounded-lg p-2 lg:p-3 border border-base-content/10"
                      >
                        <span className="text-base-content text-xs lg:text-sm truncate">
                          {item}
                        </span>
                        <span className="text-warning text-xs flex-shrink-0 ml-2">
                          Preparing
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 lg:w-20 lg:h-20 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 lg:w-16 lg:h-16 bg-secondary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
