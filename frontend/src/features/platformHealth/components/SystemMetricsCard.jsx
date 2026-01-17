// frontend/src/features/platformHealth/components/SystemMetricsCard.jsx
import React from "react";
import { Server, Cpu, HardDrive, Activity } from "lucide-react";

const SystemMetricsCard = ({ metrics }) => {
  const { cpu, memory, disk, uptime } = metrics;

  // Format uptime
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return "text-error";
    if (percentage >= 75) return "text-warning";
    return "text-success";
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "progress-error";
    if (percentage >= 75) return "progress-warning";
    return "progress-success";
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-6">
        <h3 className="card-title text-lg flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          System Resources
        </h3>

        <div className="space-y-6">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4 text-base-content/70" />
                CPU
              </span>
              <span
                className={`text-sm font-bold ${getStatusColor(cpu.usage)}`}
              >
                {cpu.usage}%
              </span>
            </div>
            <progress
              className={`progress w-full ${getProgressBarColor(cpu.usage)}`}
              value={cpu.usage}
              max="100"
            ></progress>
            <div className="text-xs text-base-content/50 mt-1">
              {cpu.cores} Cores • Load:{" "}
              {cpu.loadAverage.map((l) => l.toFixed(2)).join(", ")}
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-base-content/70" />
                Memory
              </span>
              <span
                className={`text-sm font-bold ${getStatusColor(
                  memory.percentage
                )}`}
              >
                {memory.percentage}%
              </span>
            </div>
            <progress
              className={`progress w-full ${getProgressBarColor(
                memory.percentage
              )}`}
              value={memory.percentage}
              max="100"
            ></progress>
            <div className="text-xs text-base-content/50 mt-1">
              {Math.round((memory.used / 1024 / 1024 / 1024) * 100) / 100} GB
              used of{" "}
              {Math.round((memory.total / 1024 / 1024 / 1024) * 100) / 100} GB
            </div>
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-base-content/70" />
                Disk
              </span>
              <span
                className={`text-sm font-bold ${getStatusColor(
                  disk.percentage
                )}`}
              >
                {disk.percentage}%
              </span>
            </div>
            <progress
              className={`progress w-full ${getProgressBarColor(
                disk.percentage
              )}`}
              value={disk.percentage}
              max="100"
            ></progress>
            <div className="text-xs text-base-content/50 mt-1">
              {Math.round((disk.used / 1024 / 1024 / 1024) * 100) / 100} GB used
              of {Math.round((disk.total / 1024 / 1024 / 1024) * 100) / 100} GB
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-base-content/70">System Uptime</span>
            <span className="font-mono font-medium">
              {formatUptime(uptime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsCard;
