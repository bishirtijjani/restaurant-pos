import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import StockAdjustments from "../../features/stockAdjustments";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Stock Adjustments" }));
  }, []);

  return <StockAdjustments />;
}

export default InternalPage;
