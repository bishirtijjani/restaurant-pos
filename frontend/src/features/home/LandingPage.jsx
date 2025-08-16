import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  GiftIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

const LandingPage = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [lostMoney, setLostMoney] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLostMoney((prev) => prev + 247);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const platforms = [
    {
      title: "Web Access",
      icon: GlobeAltIcon,
      description: "Access from any browser",
      features: [
        "Real-time updates",
        "No installation needed",
        "Secure cloud backup",
      ],
    },
    {
      title: "Mobile App",
      icon: DevicePhoneMobileIcon,
      description: "Native apps for Android and iOS",
      features: ["Barcode scanning", "Offline mode", "Push notifications"],
    },
    {
      title: "Desktop Software",
      icon: ComputerDesktopIcon,
      description: "Powerful desktop applications",
      features: ["Advanced reporting", "Local database", "Faster processing"],
    },
    {
      title: "Tablet Optimized",
      icon: DeviceTabletIcon,
      description: "Perfect for operations and retail",
      features: [
        "Touch-friendly interface",
        "Large display support",
        "Mobile POS ready",
      ],
    },
  ];

  const features = [
    {
      title: "10X Profit Boost™",
      description: "AI algorithm identifies hidden profit opportunities",
      icon: ArrowTrendingUpIcon,
    },
    {
      title: "Zero-Loss Guarantee™",
      description: "Theft prevention system with compensation",
      icon: ShieldCheckIcon,
    },
    {
      title: "Future-Stock Prediction™",
      description: "AI predicts inventory needs before stock runs out",
      icon: ChartBarIcon,
    },
  ];

  const bonuses = [
    {
      title: "Business Analytics Dashboard",
      value: "₦250,000",
      description: "Advanced analytics and reporting",
    },
    {
      title: "Inventory Optimization Masterclass",
      value: "₦150,000",
      description: "6-week video course on inventory management",
    },
    {
      title: "Premium Support Package",
      value: "₦200,000",
      description: "1 year of priority support",
    },
    {
      title: "Mobile App Access",
      value: "₦100,000",
      description: "Premium mobile business monitoring",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-600 inline-block px-4 py-2 rounded-full mb-6 ">
              <span className="text-lg font-semibold">
                Money Lost Today: ₦{lostMoney.toLocaleString()}
              </span>
            </div>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Revolutionize Your Inventory Management
            </h1>
            <p className="text-xl mb-10 text-gray-200">
              The ONLY inventory system that guarantees to increase your profits
              by at least 300% in 90 days <br /> ...or we pay you back your
              money in full, No questions asked ❗
            </p>
            <div className="bg-white/10 p-4 rounded-lg mb-8">
              <p className="text-lg font-bold text-yellow-300">
                🔥 LIMITED TIME OFFER: First 10 businesses this month get
                lifetime access for a one-time payment
              </p>
              <p className="text-sm mt-2 text-red-300">
                (Only 4 spots remaining)
              </p>
            </div>
            <button
              onClick={() => setShowDemo(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition-all transform hover:scale-105 animate-pulse"
            >
              CLAIM YOUR SPOT NOW
            </button>
          </div>
        </div>
      </div>

      {/* Platforms Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Work Across All Devices
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-gray-100 shadow-md p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <platform.icon className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="font-bold text-xl mb-2">{platform.title}</h3>
                <p className="text-gray-600 mb-4">{platform.description}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {platform.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-100 shadow-md">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Revolutionary Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg text-center shadow-md hover:shadow-xl transition-shadow"
              >
                <feature.icon className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-900 to-purple-800 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/10 p-12 rounded-lg backdrop-blur">
              <h2 className="text-4xl font-bold mb-8">
                Your Investment in Unlimited Profits
              </h2>
              <div className="mb-8">
                <p className="text-6xl font-bold text-green-400">₦350,000</p>
                <p className="text-xl mt-4 text-green-300">
                  + ₦50,000/year maintenance
                  <br />
                  <span className="text-sm">
                    (Less than the profit you'll make in 2 days!)
                  </span>
                </p>
              </div>
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center bg-white/5 p-4 rounded">
                  <CheckIcon className="text-green-400 mr-4 h-6 w-6" />
                  <div>
                    <h4 className="font-bold">₦1,000,000 Profit Guarantee</h4>
                    <p className="text-sm">
                      If you don't see results in 90 days
                    </p>
                  </div>
                </div>
                <div className="flex items-center bg-white/5 p-4 rounded">
                  <CheckIcon className="text-green-400 mr-4 h-6 w-6" />
                  <div>
                    <h4 className="font-bold">Lifetime Access</h4>
                    <p className="text-sm">Including all future updates</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/5 p-4 rounded">
                  <CheckIcon className="text-green-400 mr-4 h-6 w-6" />
                  <div>
                    <h4 className="font-bold">24/7 VIP Support</h4>
                    <p className="text-sm">Direct line to our tech team</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDemo(true)}
                className="bg-green-500 text-white px-12 py-6 rounded-lg font-bold text-xl hover:bg-green-600 transition-colors w-full animate-pulse"
              >
                SECURE YOUR SPOT NOW
                <br />
                <span className="text-sm">
                  (Only 3 spots remaining at this price)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* comparison table */}
      <div className="m-10 overflow-x-auto border-collapse rounded-3xl border-2 border-primary">
        <table className="table table-auto w-full overflow-auto">
          <thead className="border-b-2 border-primary">
            <tr className="bg-gray-100 shadow-md text-primary">
              <th className="p-3 text-primary border border-primary ">
                Feature/Aspect 👨‍🏫
              </th>
              <th className="p-3 text-primary border border-primary ">
                Without This System 🚫
              </th>
              <th className="p-3 text-primary border border-primary ">
                With This System ✅
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-primary">Inventory Tracking</td>
              <td className="p-3 border border-primary">
                Manual, error-prone, and time-consuming
              </td>
              <td className="p-3 border border-primary">
                Automated, real-time tracking with alerts
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-3 border border-primary">Expense Management</td>
              <td className="p-3 border border-primary">
                Hard to track spending, leading to losses
              </td>
              <td className="p-3 border border-primary">
                Organized records with easy reporting
              </td>
            </tr>
            <tr>
              <td className="p-3 border border-primary">Sales Monitoring</td>
              <td className="p-3 border border-primary">
                Difficult to analyze sales trends
              </td>
              <td className="p-3 border border-primary">
                Instant insights with dashboards
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-3 border border-primary">Loss Prevention</td>
              <td className="p-3 border border-primary">
                Unnoticed stock losses and theft
              </td>
              <td className="p-3 border border-primary">
                Transparency with detailed logs
              </td>
            </tr>
            <tr>
              <td className="p-3 border border-primary">Customer Experience</td>
              <td className="p-3 border border-primary">Long checkout times</td>
              <td className="p-3 border border-primary">
                Faster transactions and improved service
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-3 border border-primary">Financial Reporting</td>
              <td className="p-3 border border-primary">
                Cumbersome bookkeeping
              </td>
              <td className="p-3 border border-primary">
                Auto-generated reports for better decisions
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bonuses Section */}
      <div className="py-16 bg-blue-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold flex align-center justify-center mb-12">
            <StarIcon className="text-error inline w-10 h-10" />
            <div> You Also Get </div>
            <StarIcon className="text-error inline w-10 h-10" />
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {bonuses.map((bonus, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <GiftIcon className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <h3 className="font-bold text-xl">Free {bonus.title}</h3>
                    <p className="text-green-600 font-semibold">
                      Worth: {bonus.value}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">{bonus.description}</p>
              </div>
            ))}
            <p className="lead text-center text-pretty text-2xl">
              All for free 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="py-16 bg-blue-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Our Bulletproof Guarantees
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-xl mb-3">60-Day Refund</h3>
              <p>Full refund if not completely satisfied</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ClockIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-xl mb-3">
                Implementation Guarantee
              </h3>
              <p>We'll ensure your system is fully operational</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <LockClosedIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-xl mb-3">Lifetime Updates</h3>
              <p>Free updates and improvements forever</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Claim Your Spot
            </h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Business Name"
                className="w-full p-3 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-3 rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                SUBMIT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
