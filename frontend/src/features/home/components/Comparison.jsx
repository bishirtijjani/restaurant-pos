// frontend/src/features/home/components/Comparison.jsx
import React from "react";

const Comparison = () => {
  return (
    <div className="py-20 bg-base-100" id="comparison">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Before vs After
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
              {" "}
              Codeket Restaurant
            </span>
          </h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            See how our system transforms restaurant operations
          </p>
        </div>

        <div className="overflow-x-auto border-collapse rounded-3xl border-2 border-primary">
          <table className="table table-auto w-full">
            <thead className="border-b-2 border-primary">
              <tr className="bg-gray-100 shadow-md text-primary">
                <th className="p-4 text-primary border border-primary">
                  Feature/Aspect 👨‍🍳
                </th>
                <th className="p-4 text-primary border border-primary">
                  Without This System 🚫
                </th>
                <th className="p-4 text-primary border border-primary">
                  With This System ✅
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border border-primary font-semibold">
                  Order Management
                </td>
                <td className="p-4 border border-primary">
                  Paper tickets, lost orders, kitchen confusion
                </td>
                <td className="p-4 border border-primary">
                  Digital orders synced to kitchen displays instantly
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border border-primary font-semibold">
                  Table Turnover
                </td>
                <td className="p-4 border border-primary">
                  Manual tracking, long wait times
                </td>
                <td className="p-4 border border-primary">
                  Real-time table status, faster seating decisions
                </td>
              </tr>
              <tr>
                <td className="p-4 border border-primary font-semibold">
                  Inventory Control
                </td>
                <td className="p-4 border border-primary">
                  Guessing stock levels, surprise shortages
                </td>
                <td className="p-4 border border-primary">
                  Automated tracking with low-stock alerts
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border border-primary font-semibold">
                  Sales Analysis
                </td>
                <td className="p-4 border border-primary">
                  End-of-day manual calculations
                </td>
                <td className="p-4 border border-primary">
                  Real-time dashboards with actionable insights
                </td>
              </tr>
              <tr>
                <td className="p-4 border border-primary font-semibold">
                  Staff Management
                </td>
                <td className="p-4 border border-primary">
                  Paper schedules, manual time tracking
                </td>
                <td className="p-4 border border-primary">
                  Digital scheduling, clock-in/out, performance metrics
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border border-primary font-semibold">
                  Customer Experience
                </td>
                <td className="p-4 border border-primary">
                  Slow service, order errors, long waits
                </td>
                <td className="p-4 border border-primary">
                  Faster service, accurate orders, happy customers
                </td>
              </tr>
              <tr>
                <td className="p-4 border border-primary font-semibold">
                  Payment Processing
                </td>
                <td className="p-4 border border-primary">
                  Manual calculations, split bill headaches
                </td>
                <td className="p-4 border border-primary">
                  One-tap payments, easy splits, multiple methods
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 border border-primary font-semibold">
                  Food Cost Management
                </td>
                <td className="p-4 border border-primary">
                  Unknown waste, unpredictable costs
                </td>
                <td className="p-4 border border-primary">
                  Track every ingredient, optimize menu pricing
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center mt-12">
          <button className="btn btn-primary btn-lg">
            Transform Your Restaurant Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
