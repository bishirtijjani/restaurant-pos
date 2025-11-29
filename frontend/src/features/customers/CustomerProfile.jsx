import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerProfile } from "./customersSlice";
import TitleCard from "../../components/Cards/TitleCard";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  DollarSign,
  FileText,
  Plus,
  ArrowLeft
} from "lucide-react";
import { openModal } from "../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import SuspenseContent from "../../containers/SuspenseContent";

const CustomerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentCustomerProfile, status, error } = useSelector((state) => state.customers);
  const settings = useSelector((state) => state.generalSettings.generalSettings);
  const currency = settings?.currency?.symbol || "$";

  const [activeTab, setActiveTab] = useState("activity");

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerProfile(id));
    }
  }, [id, dispatch]);

  if (status === "loading") return <SuspenseContent />;
  if (error) return <div className="text-center text-error p-10">{error}</div>;
  if (!currentCustomerProfile) return <div className="text-center p-10">Customer not found</div>;

  const { customer, reservations, orders, payments, stats } = currentCustomerProfile;

  const handleAddNote = () => {
    dispatch(openModal({
      title: "Add Note",
      bodyType: MODAL_BODY_TYPES.ADD_CUSTOMER_NOTE,
      extraObject: { customerId: customer._id, customerName: customer.fullname },
      size: "md"
    }));
  };

  const handleRecordPayment = () => {
    dispatch(openModal({
      title: "Record Payment",
      bodyType: MODAL_BODY_TYPES.RECORD_CUSTOMER_PAYMENT,
      extraObject: { customerId: customer._id, customerName: customer.fullname },
      size: "md"
    }));
  };

  const handleEditCustomer = () => {
    dispatch(openModal({
      title: "Edit Customer",
      bodyType: MODAL_BODY_TYPES.EDIT_CUSTOMER,
      extraObject: customer,
      size: "md"
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header / Basic Info */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Stats */}
        <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="avatar placeholder mb-4">
                            <div className="bg-primary text-primary-content rounded-full w-24 h-24 text-3xl">
                                {customer.fullname.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        <h2 className="card-title text-2xl">{customer.fullname}</h2>
                        <div className="badge badge-outline mt-2">ID: {customer._id.slice(-6)}</div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary" />
                            <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary" />
                                <span>{customer.email}</span>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{customer.address}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <span>Debt Limit: <span className="font-bold">{currency}{customer.debtLimit?.toLocaleString()}</span></span>
                        </div>
                    </div>

                    <div className="card-actions justify-center mt-6">
                        <button className="btn btn-primary btn-sm btn-wide" onClick={handleEditCustomer}>Edit Profile</button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats stats-vertical shadow w-full bg-base-100">
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Total Spent</div>
                    <div className="stat-value text-primary">{currency}{stats.totalSpent?.toLocaleString()}</div>
                    <div className="stat-desc">Lifetime value</div>
                </div>
                
                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Total Visits</div>
                    <div className="stat-value text-secondary">{stats.visitCount}</div>
                    <div className="stat-desc">Completed orders</div>
                </div>
                
                <div className="stat">
                    <div className="stat-figure text-error">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Outstanding Balance</div>
                    <div className={`stat-value ${stats.outstandingBalance > 0 ? "text-error" : "text-success"}`}>
                        {currency}{stats.outstandingBalance?.toLocaleString()}
                    </div>
                    <div className="stat-desc">
                        {stats.outstandingBalance > 0 ? "Payment required" : "All clear"}
                    </div>
                    {stats.outstandingBalance > 0 && (
                        <div className="stat-actions">
                            <button className="btn btn-sm btn-success" onClick={handleRecordPayment}>Record Payment</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Activity Tabs */}
        <div className="lg:col-span-2 space-y-6">
            <div className="tabs tabs-boxed bg-base-100 p-2">
                <a className={`tab ${activeTab === "activity" ? "tab-active" : ""}`} onClick={() => setActiveTab("activity")}>Activity</a>
                <a className={`tab ${activeTab === "reservations" ? "tab-active" : ""}`} onClick={() => setActiveTab("reservations")}>Reservations</a>
                <a className={`tab ${activeTab === "orders" ? "tab-active" : ""}`} onClick={() => setActiveTab("orders")}>Orders</a>
                <a className={`tab ${activeTab === "payments" ? "tab-active" : ""}`} onClick={() => setActiveTab("payments")}>Payments</a>
                <a className={`tab ${activeTab === "notes" ? "tab-active" : ""}`} onClick={() => setActiveTab("notes")}>Notes</a>
            </div>

            {/* Tab Content */}
            <div className="bg-base-100 rounded-xl shadow-xl p-6 min-h-[500px]">
                {activeTab === "activity" && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                        {/* Combine recent items or just show summary */}
                        <div className="alert alert-info shadow-sm">
                            <Clock className="w-6 h-6" />
                            <span>Showing most recent interactions across the system.</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Recent Orders */}
                            {orders && orders.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm opacity-70 mb-2">Recent Orders</h4>
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order._id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg mb-2">
                                            <div>
                                                <div className="font-bold">Order #{order.orderNumber}</div>
                                                <div className="text-xs">{new Date(order.createdAt).toLocaleDateString()} • {order.orderType}</div>
                                            </div>
                                            <div className="font-bold">{currency}{order.totalAmount}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent Reservations */}
                            {reservations && reservations.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm opacity-70 mb-2">Upcoming Reservations</h4>
                                    {reservations.slice(0, 3).map(res => (
                                        <div key={res._id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg mb-2">
                                            <div>
                                                <div className="font-bold">{new Date(res.reservationDate).toLocaleDateString()} @ {res.reservationTime}</div>
                                                <div className="text-xs">Party of {res.partySize} • {res.status}</div>
                                            </div>
                                            <div className="badge badge-sm">{res.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "reservations" && (
                    <div>
                        <h3 className="font-bold text-lg mb-4">Reservation History</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Party</th>
                                        <th>Status</th>
                                        <th>Table</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations?.map(res => (
                                        <tr key={res._id}>
                                            <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                                            <td>{res.reservationTime}</td>
                                            <td>{res.partySize}</td>
                                            <td><div className="badge badge-sm">{res.status}</div></td>
                                            <td>{res.tableId?.tableNumber || "N/A"}</td>
                                        </tr>
                                    ))}
                                    {(!reservations || reservations.length === 0) && (
                                        <tr><td colSpan="5" className="text-center py-4">No reservations found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div>
                        <h3 className="font-bold text-lg mb-4">Order History</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders?.map(order => (
                                        <tr key={order._id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.orderType}</td>
                                            <td>{currency}{order.totalAmount}</td>
                                            <td><div className="badge badge-sm">{order.orderStatus}</div></td>
                                        </tr>
                                    ))}
                                    {(!orders || orders.length === 0) && (
                                        <tr><td colSpan="5" className="text-center py-4">No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "payments" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Payment History</h3>
                            <button className="btn btn-sm btn-primary" onClick={handleRecordPayment}>
                                <Plus size={16} /> Record Payment
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Note</th>
                                        <th>Recorded By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments?.map(payment => (
                                        <tr key={payment._id}>
                                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td className="text-success font-bold">+{currency}{payment.amount}</td>
                                            <td>{payment.paymentMethod}</td>
                                            <td>{payment.note || "-"}</td>
                                            <td>{payment.createdBy?.name || "Unknown"}</td>
                                        </tr>
                                    ))}
                                    {(!payments || payments.length === 0) && (
                                        <tr><td colSpan="5" className="text-center py-4">No payments recorded</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "notes" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Customer Notes</h3>
                            <button className="btn btn-sm btn-primary" onClick={handleAddNote}>
                                <Plus size={16} /> Add Note
                            </button>
                        </div>
                        <div className="space-y-4">
                            {customer.notes?.slice().reverse().map((note, idx) => (
                                <div key={idx} className="chat chat-start w-full">
                                    <div className="chat-header opacity-50 text-xs mb-1">
                                        {new Date(note.createdAt).toLocaleString()}
                                    </div>
                                    <div className="chat-bubble chat-bubble-primary w-full max-w-full">
                                        {note.content}
                                    </div>
                                </div>
                            ))}
                            {(!customer.notes || customer.notes.length === 0) && (
                                <div className="text-center py-10 text-base-content/50">
                                    <FileText className="mx-auto mb-2 opacity-50" size={40} />
                                    <p>No notes yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
