import React from "react";
import {
  Tag,
  DollarSign,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  FileText,
  Calendar,
  Percent,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../../utils/numberFormat";
import { useSelector } from "react-redux";

const ViewMenuItemModalBody = ({ extraObject }) => {
  const menuItem = extraObject;
  const { settings } = useSelector((state) => state.generalSettings);
  const currency = settings?.currency?.symbol || "$";

  if (!menuItem) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">No menu item data available</p>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value, badge = false, badgeColor = "" }) => (
    <div className="flex items-start gap-3 py-3 border-b border-base-200 last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-base-content/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-base-content/60 mb-1">{label}</p>
        {badge ? (
          <span className={`badge ${badgeColor} gap-1`}>{value}</span>
        ) : (
          <p className="text-base font-medium break-words">{value || "—"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Image Section */}
      {menuItem.image && (
        <div className="flex justify-center bg-base-200 rounded-lg p-4">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="max-h-48 object-contain rounded-md"
          />
        </div>
      )}

      {!menuItem.image && (
        <div className="flex justify-center items-center bg-base-200 rounded-lg p-8">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-base-content/30 mb-2" />
            <p className="text-sm text-base-content/50">No image available</p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Basic Information
          </h3>

          <div className="space-y-0">
            <InfoRow icon={Tag} label="Item Name" value={menuItem.name} />
            <InfoRow icon={Tag} label="Category" value={menuItem.category} />
            <InfoRow
              icon={DollarSign}
              label="Selling Price"
              value={`${currency}${formatCurrency(menuItem.price)}`}
            />
            <InfoRow
              icon={DollarSign}
              label="Cost Price"
              value={menuItem.costPrice ? `${currency}${formatCurrency(menuItem.costPrice)}` : "Not set"}
            />
            <InfoRow
              icon={Package}
              label="Item Code"
              value={menuItem.itemCode || "Not assigned"}
            />
            <InfoRow
              icon={Clock}
              label="Preparation Time"
              value={`${menuItem.preparationTime} minutes`}
            />
            <InfoRow
              icon={CheckCircle}
              label="Availability Status"
              value={menuItem.isAvailable ? "Available" : "Unavailable"}
              badge={true}
              badgeColor={menuItem.isAvailable ? "badge-success" : "badge-error"}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      {menuItem.description && (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description
            </h3>
            <p className="text-base-content/80 whitespace-pre-wrap">
              {menuItem.description}
            </p>
          </div>
        </div>
      )}

      {/* Custom Tax Settings */}
      {menuItem.customTax?.enabled && (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Custom Tax Settings
            </h3>
            <div className="space-y-0">
              <InfoRow
                icon={Percent}
                label="Tax Rate"
                value={`${menuItem.customTax.rate}%`}
              />
              <div className="py-3">
                <span className="badge badge-info">
                  Custom tax overrides global tax rate
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add-On Groups */}
      {menuItem.addOnGroups && menuItem.addOnGroups.length > 0 && (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add-On Groups ({menuItem.addOnGroups.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {menuItem.addOnGroups.map((groupId, index) => (
                <span key={groupId || index} className="badge badge-outline">
                  {typeof groupId === 'object' ? groupId.name : groupId}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Record Information
          </h3>
          <div className="space-y-0">
            <InfoRow
              icon={Calendar}
              label="Created"
              value={
                menuItem.createdAt
                  ? new Date(menuItem.createdAt).toLocaleString()
                  : "N/A"
              }
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={
                menuItem.updatedAt
                  ? new Date(menuItem.updatedAt).toLocaleString()
                  : "N/A"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMenuItemModalBody;
