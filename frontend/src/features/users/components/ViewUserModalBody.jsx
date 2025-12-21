import React from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Crown,
  UserCheck,
  Settings,
  Activity,
} from "lucide-react";

const getRoleBadgeClass = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "badge-error";
    case "manager":
      return "badge-warning";
    case "cashier":
      return "badge-success";
    case "waiter":
      return "badge-accent";
    case "kitchen":
      return "badge-neutral";
    case "accountant":
      return "badge-primary";
    case "staff":
      return "badge-info";
    default:
      return "badge-ghost";
  }
};

const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return <Crown className="w-4 h-4" />;
    case "manager":
      return <Shield className="w-4 h-4" />;
    case "cashier":
      return <Settings className="w-4 h-4" />;
    case "waiter":
      return <Calendar className="w-4 h-4" />;
    case "kitchen":
      return <Settings className="w-4 h-4" />;
    case "accountant":
      return <User className="w-4 h-4" />;
    case "staff":
      return <UserCheck className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const ViewUserModalBody = ({ closeModal, extraObject }) => {
  const user = extraObject;

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60">User data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-16 h-16">
            <User className="w-8 h-8" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.fullname}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`badge ${getRoleBadgeClass(
                user.role
              )} gap-1 font-medium`}
            >
              {getRoleIcon(user.role)}
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </div>
            <span className="text-sm text-base-content/60">
              ID: {user._id?.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Information */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold text-primary">
              <Mail className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="divider my-1"></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-base-content/60" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold text-primary">
              <Calendar className="w-4 h-4" />
              Account Information
            </h3>
            <div className="divider my-1"></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/60" />
                <span className="text-sm">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.updatedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm">
                    Updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Last Action */}
      {user.lastAction?.action && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold text-primary">
              <Activity className="w-4 h-4" />
              Last Activity
            </h3>
            <div className="divider my-1"></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-outline">
                  {user.lastAction.action}
                </span>
                {user.lastAction.reason && (
                  <span className="text-sm text-base-content/70">
                    - {user.lastAction.reason}
                  </span>
                )}
              </div>
              {user.lastAction.createdAt && (
                <div className="text-sm text-base-content/60">
                  {new Date(user.lastAction.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Status */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h3 className="card-title text-sm font-semibold text-primary">
            <Shield className="w-4 h-4" />
            Security Status
          </h3>
          <div className="divider my-1"></div>
          <div className="flex flex-wrap gap-2">
            <div
              className={`badge ${
                user.securityQuestions?.length > 0
                  ? "badge-success"
                  : "badge-warning"
              } gap-1`}
            >
              {user.securityQuestions?.length > 0
                ? "Security Questions Configured"
                : "No Security Questions"}
            </div>
            <div
              className={`badge ${
                user.pinCode ? "badge-success" : "badge-ghost"
              } gap-1`}
            >
              {user.pinCode ? "PIN Configured" : "No PIN Set"}
            </div>
            {user.refreshTokens?.length > 0 && (
              <div className="badge badge-info gap-1">
                {user.refreshTokens.length} Active Session(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="modal-action">
        <button onClick={closeModal} className="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewUserModalBody;
