import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MockInventory from "../../features/inventory/MockInventory";

function MockInventoryPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Inventory Management" }));
  }, []);

  return <MockInventory />;
}

export default MockInventoryPage;
