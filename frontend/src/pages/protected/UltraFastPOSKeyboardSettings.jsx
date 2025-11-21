// frontend/src/pages/protected/KeyboardSettings.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import UltraFastPOSKeyboardSettings from "../../features/ultraFastPOS/components/KeyboardSettings";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Keyboard Settings" }));
  }, []);

  return <UltraFastPOSKeyboardSettings />;
}

export default InternalPage;
