import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MockOverview from "../../features/analytics/dashboards/Overview/MockOverview";

function MockAnalyticsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Analytics Overview" }));
  }, []);

  return <MockOverview />;
}

export default MockAnalyticsPage;
