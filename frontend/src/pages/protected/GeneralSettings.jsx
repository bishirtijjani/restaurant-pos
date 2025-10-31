import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import GeneralSettings from "../../features/settings/generalSettings";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Settings" }));
  }, []);

  return <GeneralSettings />;
}

export default InternalPage;
