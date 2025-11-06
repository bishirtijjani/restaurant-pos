import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import SuspenseContent from "../../containers/SuspenseContent";
import {
  fetchPurchaseOrderById,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  clearCurrentOrder,
} from "./purchaseOrdersSlice";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  DollarSign,
  User,
  FileText,
  Check,
  X,
  Edit3,
  Printer,
} from "lucide-react";
import { checkRole } from "../../utils/Helpers";

const STATUS_COLORS = {
  draft: "badge-ghost",
  pending: "badge-info",
  approved: "badge-primary",
  received: "badge-success",
  cancelled: "badge-error",
};

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.purchaseOrders);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );
  const currency = settings?.currency?.symbol || "₦";

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseOrderById(id));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [id, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return