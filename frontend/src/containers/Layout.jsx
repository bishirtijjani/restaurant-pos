import PageContent from "./PageContent";
import LeftSidebar from "./LeftSidebar";
import { useSelector, useDispatch } from "react-redux";
import RightSidebar from "./RightSidebar";
import { useEffect } from "react";
import { removeNotificationMessage } from "../features/common/headerSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalLayout from "./ModalLayout";
import OnboardingTour from "../features/onboarding/OnboardingTour";
import { useLocation } from "react-router-dom";
import { getTourId } from "../utils/Helpers";
import { getCurrentUser } from "../app/authSlice";

function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const { newNotificationMessage, newNotificationStatus } = useSelector(
    (state) => state.header
  );

  useEffect(() => {
    // Ensure user is loaded when layout mounts
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) toast.success(newNotificationMessage);
      if (newNotificationStatus === 0) toast.error(newNotificationMessage);
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage, newNotificationStatus, dispatch]);

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input
          id="left-sidebar-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <PageContent />
        <LeftSidebar />
      </div>

      <RightSidebar />

      <ToastContainer />

      <ModalLayout />

      <OnboardingTour tourId={getTourId()} />
    </>
  );
}

export default Layout;
