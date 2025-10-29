// frontend/src/features/home/components/FAQs.jsx
import React from "react";
import {
  HelpCircle,
  Clock,
  RefreshCw,
  Building2,
  CreditCard,
  Shield,
  Users,
  Smartphone,
} from "lucide-react";

const FAQs = () => {
  const faqs = [
    {
      icon: Clock,
      question: "How quickly can I get started?",
      answer:
        "You can be up and running in under 30 minutes! Our intuitive setup wizard guides you through menu creation, table configuration, and staff setup. Most restaurants are taking orders on day one.",
    },
    {
      icon: RefreshCw,
      question: "Can I import my existing menu and data?",
      answer:
        "Absolutely! We support imports from Excel, CSV, and most popular restaurant systems. Our migration team provides free assistance to ensure all your menu items, pricing, and customer data transfer seamlessly.",
    },
    {
      icon: Smartphone,
      question: "Does it work offline during internet outages?",
      answer:
        "Yes! Our POS system works offline, storing orders locally until connectivity returns. You can continue taking orders and processing payments without interruption. Everything syncs automatically when you're back online.",
    },
    {
      icon: Users,
      question: "How many staff members can use the system?",
      answer:
        "Depends on your plan. Starter includes 5 staff accounts, Professional supports up to 25, and Enterprise offers unlimited staff. Each team member gets role-based access for security.",
    },
    {
      icon: Building2,
      question: "Can I manage multiple restaurant locations?",
      answer:
        "Definitely! Manage all your locations from one central dashboard with real-time data synchronization. Track sales, inventory, and performance across all sites while maintaining location-specific settings.",
    },
    {
      icon: Shield,
      question: "How secure is my restaurant data?",
      answer:
        "Enterprise-grade security with 256-bit SSL encryption, PCI-DSS compliance for payments, regular automated backups, and 99.9% uptime guarantee. Your data is stored in secure cloud servers with redundancy.",
    },
    {
      icon: CreditCard,
      question: "What payment methods are supported?",
      answer:
        "We support all major payment types: cash, credit/debit cards, mobile payments (Apple Pay, Google Pay), split bills, and custom payment methods. Integrated payment processing with competitive rates available.",
    },
    {
      icon: HelpCircle,
      question: "What kind of support do you provide?",
      answer:
        "All plans include email support and extensive documentation. Professional and Enterprise plans get priority support with faster response times, phone support, and dedicated account managers to ensure your success.",
    },
  ];

  return (
    <div
      className="py-20 bg-gradient-to-b from-base-100 to-base-200 relative overflow-hidden"
      id="faqs"
    >
      {/* Background decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <HelpCircle className="w-4 h-4" />
            Got Questions?
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-base-content">
            Everything You Need to
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Know
            </span>
          </h2>

          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Common questions from restaurant owners who've transformed their
            operations. Can't find what you're looking for? We're here to help!
          </p>
        </div>

        {/* FAQs Grid */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group collapse collapse-plus bg-base-100/70 backdrop-blur-xl border border-base-content/10 rounded-2xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-4 group-hover:text-primary transition-colors duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  <faq.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="flex-1">{faq.question}</span>
              </div>
              <div className="collapse-content">
                <div className="pl-16 pb-2 pt-2">
                  <p className="text-base-content/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-base-100/60 backdrop-blur-xl border border-base-content/10 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-base-content mb-4">
              Still Have Questions?
            </h3>
            <p className="text-base-content/70 mb-6">
              Our restaurant technology experts are ready to help you find the
              perfect solution for your establishment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/+2349063503232"
                className="btn btn-primary btn-lg"
              >
                Talk to an Expert
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
