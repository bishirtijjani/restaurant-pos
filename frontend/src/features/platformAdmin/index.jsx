import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../common/headerSlice";
import { setActiveStore, setActiveStoreDetails } from "../common/storeSlice";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

function PlatformAdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [impersonating, setImpersonating] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/platform-admin/organizations");
      setOrganizations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching organizations", error);
      dispatch(showNotification({ message: "Failed to load organizations", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleUpdateStatus = async (id, status, orgName) => {
    if (status === "suspended" && !window.confirm(`Are you sure you want to suspend access for ${orgName}? Their staff will be immediately logged out.`)) return;

    try {
      await axios.patch(`/api/platform-admin/organizations/${id}/status`, { status });
      dispatch(showNotification({ message: `${orgName} has been ${status}`, status: 1 }));
      fetchOrgs();
    } catch (error) {
      console.error("Error updating status", error);
      dispatch(showNotification({ message: "Failed to update status", status: 0 }));
    }
  };

  const handleUpdatePlan = async (id, plan, orgName) => {
    try {
      await axios.patch(`/api/platform-admin/organizations/${id}/plan`, { plan });
      dispatch(showNotification({ message: `${orgName} plan updated to ${plan.toUpperCase()}`, status: 1 }));
      fetchOrgs();
    } catch (error) {
      console.error("Error updating plan", error);
      dispatch(showNotification({ message: "Failed to update plan", status: 0 }));
    }
  };

  const handleImpersonate = async (org) => {
    try {
      // Save original context before impersonating
      const originalStoreId = localStorage.getItem("activeStoreId");
      localStorage.setItem("originalStoreId", originalStoreId || "");
      localStorage.setItem("impersonatingOrg", org._id);
      localStorage.setItem("impersonatingOrgName", org.name);

      // Get the first store of this organization
      const res = await axios.get(`/api/stores?organizationId=${org._id}`);
      const stores = res.data.data || [];
      
      if (stores.length === 0) {
        dispatch(showNotification({ message: "This organization has no stores", status: 0 }));
        return;
      }

      const targetStore = stores[0];
      
      // Set the active store to impersonate
      dispatch(setActiveStore(targetStore._id));
      dispatch(setActiveStoreDetails(targetStore));
      setImpersonating(org);
      
      dispatch(showNotification({ 
        message: `Now viewing as owner of ${org.name}`, 
        status: 1 
      }));
      
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Error impersonating", error);
      dispatch(showNotification({ message: "Failed to enter organization", status: 0 }));
    }
  };

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            org.ownerId?.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = filterPlan === "all" || org.plan === filterPlan;
      return matchesSearch && matchesPlan;
    });
  }, [organizations, searchQuery, filterPlan]);

  const TopActions = (
    <div className="flex gap-4 w-full md:w-auto">
      <div className="relative w-full md:w-64">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-base-content/50" />
        <input 
          type="text" 
          placeholder="Search org or owner..." 
          className="input input-sm input-bordered w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <select 
        className="select select-sm select-bordered"
        value={filterPlan}
        onChange={(e) => setFilterPlan(e.target.value)}
      >
        <option value="all">All Plans</option>
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
      </select>
    </div>
  );

  return (
    <>
      <TitleCard title="Platform Admin Hub" topMargin="mt-2" TopSideButtons={TopActions}>
        {loading ? (
          <div className="flex justify-center flex-col items-center pb-24 pt-24 space-y-4">
            <span className="loading loading-ring loading-lg text-primary"></span>
            <span className="text-sm text-base-content/50 font-medium">Fetching global network status...</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="table table-zebra table-sm md:table-md w-full">
              <thead>
                <tr className="bg-base-200">
                  <th><div className="flex items-center gap-2"><BuildingOfficeIcon className="w-4 h-4"/>Organization</div></th>
                  <th><div className="flex items-center gap-2"><UserIcon className="w-4 h-4"/>Owner</div></th>
                  <th className="text-center"><div className="flex justify-center items-center gap-2"><ChartBarIcon className="w-4 h-4"/>Stores</div></th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => {
                  const isSuspended = org.status === "suspended";
                  return (
                    <tr key={org._id} className={isSuspended ? "opacity-50" : ""}>
                      <td>
                        <div className="font-bold text-base">{org.name}</div>
                        <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                          {org.industry}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{org.ownerId?.fullname}</div>
                        <div className="text-xs opacity-60 font-mono tracking-tighter">{org.ownerId?.email}</div>
                      </td>
                      <td className="text-center">
                        <div className="badge badge-ghost font-bold">{org.storeCount || 0}</div>
                      </td>
                      <td>
                        <select
                          className="select select-bordered select-xs w-full max-w-[120px]"
                          value={org.plan || "free"}
                          onChange={(e) => handleUpdatePlan(org._id, e.target.value, org.name)}
                          disabled={isSuspended}
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td>
                        <div
                          className={`badge badge-sm font-bold shadow-sm ${
                            org.status === "active" ? "badge-success" : isSuspended ? "badge-error" : "badge-info"
                          } gap-1`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-white' : 'bg-white/50'}`}></div>
                          {org.status}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-primary btn-xs btn-outline"
                            onClick={() => handleImpersonate(org)}
                            title="Enter this restaurant as owner"
                          >
                            <ArrowRightOnRectangleIcon className="w-3 h-3" />
                            Enter
                          </button>
                          {org.status === "active" ? (
                            <button
                              className="btn btn-error btn-xs btn-outline"
                              onClick={() => handleUpdateStatus(org._id, "suspended", org.name)}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() => handleUpdateStatus(org._id, "active", org.name)}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <BuildingOfficeIcon className="w-12 h-12 mx-auto text-base-content/20 mb-4" />
                      <h3 className="text-lg font-bold text-base-content/60">No organizations found</h3>
                      <p className="text-sm text-base-content/40 mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>
    </>
  );
}

export default PlatformAdminDashboard;
