import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import PurchaseOrders from "../../features/purchaseOrders";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Purchase Orders" }));
  }, []);

  return <PurchaseOrders />;
}

export default InternalPage;
