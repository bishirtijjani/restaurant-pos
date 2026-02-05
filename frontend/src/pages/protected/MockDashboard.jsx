import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MockDashboard from "../../features/dashboard/MockDashboard";

function MockDashboardPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard" }));
  }, []);

  return <MockDashboard />;
}

export default MockDashboardPage;
