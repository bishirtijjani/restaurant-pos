import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditLogs } from "./auditLogsSlice";
import AuditLogFilters from "./components/AuditLogFilters";
import AuditLogTable from "./components/AuditLogTable";
import LogDetailModal from "./components/LogDetailModal";
import { Activity } from "lucide-react";

const AuditLogsPage = () => {
  const dispatch = useDispatch();
  const { logs, pagination, isLoading } = useSelector(
    (state) => state.auditLogs,
  );

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    userId: "",
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    dispatch(getAuditLogs(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-base-content/60">
            Track system activity and sensitive changes
          </p>
        </div>
      </div>

      <AuditLogFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <AuditLogTable
          logs={logs}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewDetail={setSelectedLog}
        />
      )}

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
