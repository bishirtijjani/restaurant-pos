import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCustomers } from "../../features/customers/customersSlice";
import { Search, User, Phone, X } from "lucide-react";

const CustomerSearch = ({ onSelect, label = "Search Customer", placeholder = "Name or Phone...", initialValue = null }) => {
  const dispatch = useDispatch();
  const { customers, status } = useSelector((state) => state.customers);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(initialValue);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCustomers());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (initialValue) {
        setSelectedCustomer(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredCustomers = customers.filter(c => 
    c.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  ).slice(0, 5); // Limit to 5 results

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    onSelect(customer);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    onSelect(null);
    setSearchTerm("");
  };

  return (
    <div className="form-control w-full" ref={wrapperRef}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-base-300">
            <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                        <span className="text-xs">{selectedCustomer.fullname.substring(0,2).toUpperCase()}</span>
                    </div>
                </div>
                <div>
                    <div className="font-bold text-sm">{selectedCustomer.fullname}</div>
                    <div className="text-xs opacity-70">{selectedCustomer.phone}</div>
                </div>
            </div>
            <button type="button" onClick={handleClear} className="btn btn-ghost btn-xs btn-circle">
                <X size={14} />
            </button>
        </div>
      ) : (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <Search className="absolute left-3 top-3 text-base-content/50" size={18} />
            </div>

            {isOpen && searchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 shadow-xl rounded-lg border border-base-200 max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                            <div
                                key={customer._id}
                                className="p-3 hover:bg-base-200 cursor-pointer border-b border-base-100 last:border-0 flex items-center gap-3"
                                onClick={() => handleSelect(customer)}
                            >
                                <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                                    <User size={14} />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{customer.fullname}</div>
                                    <div className="text-xs text-base-content/60 flex items-center gap-1">
                                        <Phone size={10} /> {customer.phone}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-center text-sm text-base-content/50">
                            No customers found
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
