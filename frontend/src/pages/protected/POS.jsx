import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MobilePOS from "../../features/orders/MobilePOS";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "POS" }));
  }, []);

  return <MobilePOS />;
}

export default InternalPage;
