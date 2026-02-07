import React, { useState } from "react";
import {
  Package,
  PlusCircle,
  RefreshCw,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Link as LinkIcon,
  Calendar,
  SquareGanttChart,
  Table,
  Search,
} from "lucide-react";

// --- Mock Components ---

const MockInventoryCard = ({ item }) => {
  const stockPercentage = (item.currentStock / item.minStockLevel) * 100;
  const isLowStock = item.currentStock <= item.minStockLevel;

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex gap-4 items-start mb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-200 flex-shrink-0 border border-base-300">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold line-clamp-1">
              {item.name}
            </h3>
            {item.sku && (
              <div className="badge badge-outline badge-sm mt-1">
                SKU: {item.sku}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs text-primary" disabled>
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="badge badge-secondary mb-3">{item.category}</div>

        {/* Stock Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-70">Current Stock</span>
            <span className="font-bold text-lg">
              {item.currentStock} {item.unit}
            </span>
          </div>

          {/* Stock Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Stock Level</span>
              <span>{Math.min(stockPercentage, 100).toFixed(0)}%</span>
            </div>
            <progress
              className={`progress ${
                isLowStock ? "progress-error" : "progress-success"
              } w-full`}
              value={item.currentStock}
              max={Math.max(item.minStockLevel * 1.5, item.currentStock)}
            ></progress>
            <div className="text-xs opacity-60 mt-1">
              Min: {item.minStockLevel} {item.unit}
            </div>
          </div>

          {/* Cost */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm opacity-70">Cost Price</span>
            <span className="font-semibold text-primary">
              £{item.costPrice.toFixed(2)}
            </span>
          </div>

          {/* Last Restock */}
          <div className="flex items-center gap-2 text-xs opacity-60">
            <Calendar className="w-3 h-3" />
            <span>Last restocked: {item.lastRestock}</span>
          </div>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="alert alert-warning mt-3 p-2 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>Low stock interrupt!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Mock Data ---

const MOCK_INVENTORY = [
  {
    _id: "1",
    name: "Beef Topside",
    sku: "MEA-010",
    category: "Meat",
    currentStock: 12.5,
    minStockLevel: 10.0,
    unit: "kg",
    costPrice: 9.8,
    lastRestock: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    _id: "2",
    name: "Maris Piper Potatoes",
    sku: "PRO-020",
    category: "Produce",
    currentStock: 45,
    minStockLevel: 25,
    unit: "25kg bag",
    costPrice: 12.5,
    lastRestock: "3 days ago",
    image: "/menu-items/Maris Piper Potatoes.jpeg",
  },
  {
    _id: "3",
    name: "Cod Fillets (8-10oz)",
    sku: "SEA-005",
    category: "Seafood",
    currentStock: 5.2,
    minStockLevel: 8.0,
    unit: "kg",
    costPrice: 14.2,
    lastRestock: "Yesterday",
    image: "/menu-items/Fish & Chips.jpeg",
  },
  {
    _id: "4",
    name: "Soft Drink Syrup (10L)",
    sku: "BEV-005",
    category: "Beverage",
    currentStock: 8,
    minStockLevel: 4,
    unit: "box",
    costPrice: 65.0,
    lastRestock: "1 week ago",
    image: "/menu-items/Sparkling Water.jpeg",
  },
  {
    _id: "5",
    name: "Brioche Buns",
    sku: "BAK-012",
    category: "Bakery",
    currentStock: 120,
    minStockLevel: 48,
    unit: "units",
    costPrice: 0.45,
    lastRestock: "Yesterday",
    image: "/menu-items/Brioche Buns.jpeg",
  },
  {
    _id: "6",
    name: "Whole Milk (4 Pnt)",
    sku: "DAI-001",
    category: "Dairy",
    currentStock: 18,
    minStockLevel: 12,
    unit: "units",
    costPrice: 1.65,
    lastRestock: "Daily",
    image: "/menu-items/Whole Milk.jpeg",
  },
];

export default function MockInventory() {
  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Inventory Management
            <div className="badge badge-primary">63 Items</div>
          </h1>
          <p className="text-base-content/70 mt-1">
            Real-time stock tracking and cost control
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost btn-circle">
            <RefreshCw size={20} />
          </button>
          <button className="btn btn-primary gap-2">
            <PlusCircle size={20} /> Add Item
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-base-100 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-3 text-base-content/50"
            size={18}
          />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search inventory..."
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="select select-bordered flex-1">
            <option>All Categories</option>
            <option>Meat</option>
            <option>Seafood</option>
            <option>Wine</option>
          </select>
          <div className="join">
            <button className="join-item btn btn-active">
              <SquareGanttChart size={18} />
            </button>
            <button className="join-item btn">
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_INVENTORY.map((item) => (
          <MockInventoryCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
