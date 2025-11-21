// frontend/src/pages/protected/KeyboardSettings.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import UltraFastPOS from "../../features/ultraFastPOS";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Fast POS" }));
  }, []);

  return <UltraFastPOS />;
}

export default InternalPage;
