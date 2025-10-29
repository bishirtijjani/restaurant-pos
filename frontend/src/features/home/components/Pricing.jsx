// frontend/src/features/home/components/Pricing.jsx
import React, { useState } from "react";
import { Store, Building2, Warehouse, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();

  const handleStartTrial = (plan) => {
    // Store selected plan in localStorage for registration
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    navigate("/register");
  };

  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Starter",
      description:
        "Perfect for small cafes and food trucks starting their journey",
      monthlyPrice: 29,
      annualPrice: 23,
      icon: <Store className="w-8 h-8" />,
      targetCustomer: "Small cafes & Food trucks",
      features: [
        "Up to 50 menu items",
        "Basic POS system",
        "Order management",
        "1 location",
        "Basic reporting",
        "Email support",
        "Table management",
        "Payment processing",
      ],
      limitations: [],
      popular: false,
      color: "primary",
    },
    {
      name: "Professional",
      description: "Ideal for growing restaurants with multiple services",
      monthlyPrice: 79,
      annualPrice: 63,
      icon: <Building2 className="w-8 h-8" />,
      targetCustomer: "Full-service restaurants",
      features: [
        "Unlimited menu items",
        "Advanced POS system",
        "Kitchen display system",
        "Up to 3 locations",
        "Inventory management",
        "Staff management",
        "Advanced analytics",
        "Customer loyalty program",
        "Priority support",
        "Online ordering integration",
        "Reservation system",
        "Mobile POS",
      ],
      limitations: [],
      popular: true,
      color: "secondary",
    },
    {
      name: "Enterprise",
      description: "Complete solution for restaurant chains and franchises",
      monthlyPrice: 149,
      annualPrice: 119,
      icon: <Warehouse className="w-8 h-8" />,
      targetCustomer: "Restaurant chains",
      features: [
        "Everything in Professional",
        "Unlimited locations",
        "Multi-brand management",
        "Custom integrations",
        "API access",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom reports",
        "Franchise management",
        "Central kitchen management",
        "Advanced forecasting",
        "White-label options",
      ],
      limitations: [],
      popular: false,
      color: "accent",
    },
  ];

  const getPrice = (plan) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice * 12;
    return monthlyCost - annualCost;
  };

  return (
    <div className="bg-base-100 py-12 lg:py-16 px-4" id="pricing">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-3 lg:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base lg:text-xl text-base-content/70 max-w-3xl mx-auto mb-6 lg:mb-8 px-4">
            Choose the perfect plan for your restaurant. All plans include core
            features with no hidden fees or long-term contracts.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 lg:gap-4 mb-6 lg:mb-8 flex-wrap">
            <span
              className={`font-medium text-sm lg:text-base ${
                !isAnnual ? "text-base-content" : "text-base-content/60"
              }`}
            >
              Monthly
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm lg:toggle-md"
              checked={isAnnual}
              onChange={(e) => setIsAnnual(e.target.checked)}
            />
            <span
              className={`font-medium text-sm lg:text-base ${
                isAnnual ? "text-base-content" : "text-base-content/60"
              }`}
            >
              Annual
            </span>
            <div className="badge badge-success badge-sm">Save up to 20%</div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular
                  ? "border-2 border-primary relative md:scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 lg:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="badge badge-primary badge-md lg:badge-lg px-4 lg:px-6 py-2 lg:py-3 text-white font-bold text-xs lg:text-sm">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="card-body p-6 lg:p-8">
                {/* Plan Header */}
                <div className="text-center mb-4 lg:mb-6">
                  <div className="flex justify-center text-primary mb-3 lg:mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-base-content mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-primary font-semibold text-xs lg:text-sm mb-2">
                    {plan.targetCustomer}
                  </div>
                  <p className="text-base-content/70 text-xs lg:text-sm min-h-[48px] flex items-center justify-center px-2">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6 lg:mb-8">
                  {isAnnual ? (
                    <>
                      {/* Annual Pricing Display */}
                      <div className="flex items-center justify-center mb-2">
                        <div className="text-right mr-2 lg:mr-3">
                          <div className="text-base lg:text-lg text-base-content/50 line-through">
                            ${plan.monthlyPrice}
                          </div>
                          <div className="text-xs text-base-content/40">
                            per month
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-4xl lg:text-5xl font-bold text-base-content">
                            ${plan.annualPrice}
                          </div>
                          <div className="text-base-content/60 text-xs lg:text-sm">
                            /month
                          </div>
                        </div>
                      </div>
                      <div className="bg-success/10 border border-success/20 rounded-lg p-2 lg:p-3 mb-3">
                        <div className="text-success font-bold text-xs lg:text-sm">
                          💰 Save ${getSavings(plan)} annually
                        </div>
                        <div className="text-xs text-success/80 mt-1">
                          ${plan.annualPrice * 12} billed annually
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Monthly Pricing Display */}
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-4xl lg:text-5xl font-bold text-base-content">
                          ${plan.monthlyPrice}
                        </span>
                        <span className="text-base-content/60 ml-2 text-sm">
                          /month
                        </span>
                      </div>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-2 lg:p-3 mb-3">
                        <div className="text-warning font-medium text-xs lg:text-sm">
                          Switch to annual and save ${getSavings(plan)}/year!
                        </div>
                      </div>
                    </>
                  )}
                  <div className="text-xs lg:text-sm text-base-content/60">
                    {isAnnual
                      ? `$${plan.annualPrice * 12} billed annually`
                      : `$${plan.monthlyPrice} billed monthly`}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleStartTrial(plan)}
                  className={`btn btn-block mb-6 lg:mb-8 btn-sm lg:btn-md ${
                    plan.popular
                      ? "btn-primary text-white"
                      : "btn-outline btn-primary"
                  } hover:scale-105 transition-transform`}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                {/* Features */}
                <div className="space-y-2 lg:space-y-3">
                  <h4 className="font-semibold text-sm lg:text-base text-base-content mb-3 lg:mb-4">
                    Everything included:
                  </h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-4 h-4 lg:w-5 lg:h-5 text-success mt-0.5 mr-2 lg:mr-3 flex-shrink-0" />
                      <span className="text-base-content/80 text-xs lg:text-sm text-left">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="text-center bg-base-200 rounded-2xl p-6 lg:p-8 mb-12 lg:mb-16">
          <h4 className="text-lg lg:text-xl font-bold text-base-content mb-4 lg:mb-6">
            Why Choose Codeket Restaurant?
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                14 Days
              </div>
              <div className="text-xs lg:text-sm text-base-content/70">
                Free Trial
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                No credit card required
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                $0
              </div>
              <div className="text-xs lg:text-sm text-base-content/70">
                Setup Fees
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                Get started instantly
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                24/7
              </div>
              <div className="text-xs lg:text-sm text-base-content/70">
                Support
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                We're always here
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                99.9%
              </div>
              <div className="text-xs lg:text-sm text-base-content/70">
                Uptime
              </div>
              <div className="text-xs text-base-content/50 mt-1">
                Reliable & secure
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 lg:p-8 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">
              Ready to Transform Your Restaurant Operations?
            </h3>
            <p className="text-base lg:text-xl mb-4 lg:mb-6 opacity-90">
              Join hundreds of restaurants streamlining operations and
              increasing profits.
            </p>
            <button className="btn btn-white text-primary hover:scale-105 transition-transform text-sm lg:text-lg px-6 lg:px-8">
              Start Your Free Trial Today
            </button>
          </div>
        </div>
      </div>

      {/* Modal for plan selection */}
      {selectedPlan && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm lg:max-w-lg">
            <h3 className="font-bold text-lg lg:text-xl mb-4">
              Get Started with {selectedPlan.name}
            </h3>
            <p className="py-4 text-sm lg:text-base">
              You've selected the {selectedPlan.name} plan at $
              {getPrice(selectedPlan)}/month. Ready to start your free trial?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-primary btn-sm lg:btn-md"
                onClick={() => {
                  // Handle trial signup
                  setSelectedPlan(null);
                }}
              >
                Start Free Trial
              </button>
              <button
                className="btn btn-sm lg:btn-md"
                onClick={() => setSelectedPlan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
