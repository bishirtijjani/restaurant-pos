// frontend/src/containers/Layout.jsx
import PageContent from "./PageContent";
import LeftSidebar from "./LeftSidebar";
import { useSelector, useDispatch } from "react-redux";
import RightSidebar from "./RightSidebar";
import { useEffect } from "react";
import { removeNotificationMessage } from "../features/common/headerSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OnboardingTour from "../features/onboarding/OnboardingTour";
import { useLocation } from "react-router-dom";
import { getTourId } from "../utils/Helpers";
import { getCurrentUser, setUserFromToken } from "../app/authSlice";
import "./drawer-fix.css";

function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const { newNotificationMessage, newNotificationStatus } = useSelector(
    (state) => state.header,
  );

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) toast.success(newNotificationMessage);
      if (newNotificationStatus === 0) toast.error(newNotificationMessage);
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage, newNotificationStatus, dispatch]);

  const isMockDashboard = location.pathname === "/app/mock-dashboard";
  const isMockSidebar = location.pathname === "/app/mock-sidebar";

  return (
    <>
      <div
        className={`drawer ${(!isMockDashboard && !isMockSidebar) || isMockSidebar ? "lg:drawer-open" : ""} min-w-full w-full min-h-screen`}
      >
        <input
          id="left-sidebar-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        {!isMockSidebar && <PageContent />}
        {(!isMockDashboard || isMockSidebar) && <LeftSidebar />}
      </div>

      {!isMockSidebar && <RightSidebar />}

      <ToastContainer />
      {/* <OnboardingTour tourId={getTourId(location.pathname)} /> */}
    </>
  );
}

export default Layout;
