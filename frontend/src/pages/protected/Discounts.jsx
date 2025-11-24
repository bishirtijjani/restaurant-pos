// frontend/src/pages/protected/Discounts.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import DiscountsManagement from "../../features/discounts";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Discounts & Promotions" }));
  }, []);

  return <DiscountsManagement />;
}

export default InternalPage;
