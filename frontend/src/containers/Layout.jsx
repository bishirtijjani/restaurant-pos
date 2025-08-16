import PageContent from "./PageContent"; // Main content of the page
import LeftSidebar from "./LeftSidebar"; // Left navigation sidebar
import { useSelector, useDispatch } from "react-redux"; // Redux hooks for state management
import RightSidebar from "./RightSidebar"; // Right sidebar for notifications or secondary content
import { useEffect } from "react"; // React hook for side effects
import { removeNotificationMessage } from "../features/common/headerSlice"; // Redux action to clear notification messages
import { ToastContainer, toast } from "react-toastify"; // For displaying toast notifications
import "react-toastify/dist/ReactToastify.css"; // Styles for toast notifications
import ModalLayout from "./ModalLayout"; // Dynamic modal container

function Layout() {
  const dispatch = useDispatch();

  // Access notification message and status from Redux store
  const { newNotificationMessage, newNotificationStatus } = useSelector(
    (state) => state.header // Accessing the `header` slice of the Redux state
  );

  useEffect(() => {
    // Display a toast notification if there is a new message
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) toast.success(newNotificationMessage); // Success message
      if (newNotificationStatus === 0) toast.error(newNotificationMessage); // Error message
      dispatch(removeNotificationMessage()); // Clear the notification after showing it
    }
  }, [newNotificationMessage, newNotificationStatus, dispatch]); // Dependencies to trigger this effect

  return (
    <>
      {/* Left drawer - Contains the page content and left sidebar */}
      <div className="drawer lg:drawer-open">
        <input
          id="left-sidebar-drawer"
          type="checkbox"
          className="drawer-toggle" // Toggles the visibility of the left sidebar
        />
        <PageContent /> {/* Displays the main page content */}
        <LeftSidebar /> {/* The left sidebar for navigation */}
      </div>

      {/* Right drawer - Contains secondary content, like notifications */}
      <RightSidebar />

      {/* Toast notification container */}
      <ToastContainer />

      {/* Modal layout container */}
      <ModalLayout />
    </>
  );
}

export default Layout;
