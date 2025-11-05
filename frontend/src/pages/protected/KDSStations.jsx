import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import KDSStations from "../../features/kdsStations";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Stations" }));
  }, []);

  return <KDSStations />;
}

export default InternalPage;
