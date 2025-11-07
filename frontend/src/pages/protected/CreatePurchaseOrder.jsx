import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import CreatePurchaseOrder from "../../features/purchaseOrders/CreatePurchaseOrder";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Create Purchase Order" }));
  }, []);

  return <CreatePurchaseOrder />;
}

export default InternalPage;
