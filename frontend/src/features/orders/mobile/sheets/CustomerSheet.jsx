// frontend/src/features/orders/mobile/sheets/CustomerSheet.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Phone, MapPin, Search, Plus, Check } from "lucide-react";
import { useHaptic } from "../../../../hooks/useHaptic";
import { BottomSheet } from "../../../../components/Mobile";
import { setCustomerDetails } from "../../posSlice";
import {
  fetchAllCustomers,
  addCustomer,
} from "../../../../features/customers/customersSlice";

/**
 * Customer Selection Sheet
 * Mobile-optimized replacement for Customer Selection
 */
const CustomerSheet = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux
  const { customers } = useSelector((state) => state.customers);
  const { customerDetails } = useSelector((state) => state.pos);

  // State
  const [view, setView] = useState("list"); // 'list' | 'add'
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleSelectCustomer = (customer) => {
    haptic.success();
    dispatch(
      setCustomerDetails({
        customerId: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      })
    );
    onClose();
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      haptic.error();
      return; // Add validation UI
    }

    haptic.success();
    // Dispatch create action (needs backend integration, simulating for now)
    const mockCustomer = { ...newCustomer, _id: Date.now().toString() };

    // In real implementation: await dispatch(addNewCustomer(newCustomer));
    dispatch(
      setCustomerDetails({
        customerId: mockCustomer._id,
        name: mockCustomer.name,
        phone: mockCustomer.phone,
        email: mockCustomer.email,
        address: mockCustomer.address,
      })
    );

    // Reset and close
    setNewCustomer({ name: "", phone: "", email: "", address: "" });
    setView("list");
    onClose();
  };

  const clearCustomer = () => {
    haptic.medium();
    dispatch(setCustomerDetails({}));
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={view === "list" ? "Select Customer" : "New Customer"}
      snapPoints={[0.9]}
    >
      <div className="flex flex-col h-full bg-base-100 overflow-hidden">
        {/* View Switcher/Header Actions */}
        <div className="px-4 pb-2 border-b border-base-200 flex justify-between items-center">
          {view === "list" ? (
            <button
              onClick={() => setView("add")}
              className="btn btn-sm btn-ghost gap-2 text-primary"
            >
              <Plus size={16} /> New Customer
            </button>
          ) : (
            <button
              onClick={() => setView("list")}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
          )}

          {customerDetails.name && (
            <button
              onClick={clearCustomer}
              className="btn btn-sm btn-ghost text-error"
            >
              Clear Selected
            </button>
          )}
        </div>

        {/* List View */}
        {view === "list" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const isSelected =
                    customerDetails.customerId === customer._id;
                  return (
                    <button
                      key={customer._id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full flex items-center p-3 rounded-xl text-left border transition-all
                                            ${
                                              isSelected
                                                ? "bg-primary/10 border-primary shadow-sm"
                                                : "bg-base-100 hover:bg-base-200 border-base-200"
                                            }
                                        `}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{customer.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <Phone size={12} /> {customer.phone}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={20} className="text-primary" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p>No customers found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add View */}
        {view === "add" && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name *</span>
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  size={18}
                />
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number *</span>
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  size={18}
                />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-base-content/50"
                  size={18}
                />
                <textarea
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  placeholder="Delivery address..."
                  className="textarea textarea-bordered w-full pl-10"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleCreateCustomer}
                className="btn btn-primary w-full btn-lg"
              >
                Save Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default CustomerSheet;
