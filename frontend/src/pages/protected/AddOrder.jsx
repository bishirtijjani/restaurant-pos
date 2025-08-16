import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import AddOrder from "../../features/orders/AddOrder";
function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Add New Order" }));
  }, []);

  return <AddOrder />;
}

export default InternalPage;
