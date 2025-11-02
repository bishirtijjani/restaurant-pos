import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import KDS from "../../features/kds";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Kitchen Dislay" }));
  }, []);

  return <KDS />;
}

export default InternalPage;
