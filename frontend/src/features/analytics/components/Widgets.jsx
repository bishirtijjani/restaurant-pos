import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, Title, Text } from "@tremor/react";

const COLORS = ["#570DF8", "#36D399", "#F87272", "#FBBD23"];

const SalesOverviewWidget = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      date: format(new Date(item._id.year, item._id.month - 1), "MMM yyyy"),
      sales: item.totalSales,
      orders: item.orderCount,
      average: item.averageOrderValue,
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl">
      <Title>Sales Overview</Title>
      <Text>Sales trend and order volume</Text>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#570DF8"
              name="Sales ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#36D399"
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const TopProductsWidget = ({ data }) => {
  console.log("Top products raw data:", data);
  const formattedData = data?.length
    ? data.slice(0, 5).map((item) => ({
        name: item.name,
        revenue: item.totalRevenue || 0,
        quantity: item.totalQuantity || 0,
      }))
    : [{ name: "No Data", revenue: 0, quantity: 0 }];

  return (
    <Card>
      {formattedData.length === 1 && formattedData[0].name === "No Data" ? (
        <Text>No product performance data available</Text>
      ) : (
        <BarChart data={formattedData} {...otherProps} />
      )}
    </Card>
  );
};

const InventoryStatusWidget = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      name: item._id,
      value: item.totalStock,
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl">
      <Title>Inventory Status</Title>
      <Text>Stock distribution by category</Text>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const CategoryAnalysisWidget = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      category: item._id,
      value: item.totalValue,
      stock: item.totalStock,
      expiring: item.expiringCount,
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl">
      <Title>Category Analysis</Title>
      <Text>Multi-dimension category performance</Text>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis />
            <Radar
              name="Value"
              dataKey="value"
              stroke="#570DF8"
              fill="#570DF8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const ProfitMarginsWidget = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      category: item.category,
      margin: item.margin,
      profit: item.grossProfit,
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl">
      <Title>Profit Margins</Title>
      <Text>Margin analysis by category</Text>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="margin" fill="#570DF8" name="Margin %" />
            <Bar dataKey="profit" fill="#36D399" name="Gross Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const ExpenseWidget = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      date: `${item._id.year}-${item._id.month}-${item._id.day}`,
      expenses: item.totalExpenses,
      categories: item.expenses,
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl">
      <Title>Expense Analysis</Title>
      <Text>Daily expense breakdown</Text>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="expenses" fill="#F87272" name="Total Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const ExpiringProductsWidget = ({ data }) => {
  console.log("data", data);
  const formattedData =
    data?.map((item) => ({
      product: item.name,
      category: item.category,
      quantity: item.totalExpiringQuantity,
      batches: item.expiringBatches.map((batch) => ({
        ...batch,
        expiryDate: format(new Date(batch.expiryDate), "PP"),
      })),
    })) || [];

  return (
    <Card className="h-full bg-base-100 rounded-3xl shadow-xl overflow-auto">
      <Title>Expiring Products</Title>
      <Text>Products expiring within 90 days</Text>
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Expiry
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formattedData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.batches[0]?.expiryDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export {
  SalesOverviewWidget,
  TopProductsWidget,
  InventoryStatusWidget,
  CategoryAnalysisWidget,
  ProfitMarginsWidget,
  ExpenseWidget,
  ExpiringProductsWidget,
};
