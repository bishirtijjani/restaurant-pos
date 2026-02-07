import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MockPOS from "../../features/orders/MockPOS";

function MockPOSPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Point of Sale" }));
  }, []);

  return <MockPOS />;
}

export default MockPOSPage;
