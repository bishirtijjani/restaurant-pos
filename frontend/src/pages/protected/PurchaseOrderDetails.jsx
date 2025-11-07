import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import PurchaseOrderDetails from "../../features/purchaseOrders/components/PurchaseOrderDetails";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Purchase Order Details" }));
  }, []);

  return <PurchaseOrderDetails />;
}

export default InternalPage;
