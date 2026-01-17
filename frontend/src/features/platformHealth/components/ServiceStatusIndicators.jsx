// frontend/src/features/platformHealth/components/ServiceStatusIndicators.jsx
import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const ServiceStatusIndicators = ({ metrics, health }) => {
  const getStatusIcon = (status) => {
    if (status === "healthy" || status === true)
      return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === "warning")
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-error" />;
  };

  const getStatusText = (status) => {
    if (status === "healthy" || status === true)
      return (
        <span className="text-success text-sm font-medium">Operational</span>
      );
    if (status === "warning")
      return <span className="text-warning text-sm font-medium">Degraded</span>;
    return <span className="text-error text-sm font-medium">Down</span>;
  };

  const services = [
    { name: "Database", status: health.checks.database },
    { name: "Metrics System", status: health.checks.metrics },
    { name: "Monitoring Service", status: health.checks.monitoring },
    { name: "Queue System", status: true }, // Placeholder
    { name: "WebSocket Server", status: true }, // Placeholder
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {services.map((service, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-base-100 p-3 rounded-lg border border-base-200 shadow-sm"
        >
          {getStatusIcon(service.status)}
          <div className="flex flex-col">
            <span className="text-xs text-base-content/60">{service.name}</span>
            {getStatusText(service.status)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceStatusIndicators;
