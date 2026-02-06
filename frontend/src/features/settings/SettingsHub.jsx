import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { User, Settings, Building, Store, Activity } from "lucide-react";

const SettingsHub = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const settingsCards = [
    {
      id: "profile",
      title: "My Profile",
      description: "Personal settings and preferences",
      icon: <User className="w-8 h-8" />,
      path: "/app/settings/profile",
      color: "bg-primary/10 text-primary",
      available: true,
    },
    {
      id: "store",
      title: "Store Configuration",
      description: "Current store settings and customization",
      icon: <Settings className="w-8 h-8" />,
      path: "/app/settings/general",
      color: "bg-secondary/10 text-secondary",
      available: true,
    },
    {
      id: "brand",
      title: "Brand Defaults",
      description: "Organization-wide default settings",
      icon: <Building className="w-8 h-8" />,
      path: "/app/brand-settings",
      color: "bg-accent/10 text-accent",
      available: isAdmin,
    },
    {
      id: "stores",
      title: "Manage Stores",
      description: "Multi-store management and switching",
      icon: <Store className="w-8 h-8" />,
      path: "/app/stores",
      color: "bg-info/10 text-info",
      available: isAdmin,
    },
    {
      id: "audit-logs",
      title: "Audit Logs",
      description: "View system activity and history",
      icon: <Activity className="w-8 h-8" />,
      path: "/app/settings/audit-logs",
      color: "bg-warning/10 text-warning",
      available: true, // Available to anyone who can see SettingsHub (Admins/Managers)
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-base-content/70">
          Manage your profile, store configuration, and brand settings
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCards
          .filter((card) => card.available)
          .map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer text-left"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="card-title text-lg mb-1">{card.title}</h2>
                    <p className="text-sm text-base-content/60">
                      {card.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-base-content/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 alert alert-info shadow-sm">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Settings Hierarchy</h3>
            <div className="text-xs mt-1">
              <strong>Profile:</strong> Your personal settings •{" "}
              <strong>Store:</strong> Current store configuration •{" "}
              <strong>Brand:</strong> Organization-wide defaults
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHub;
