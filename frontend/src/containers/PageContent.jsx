import Header from "./Header"; // Header component for navigation or branding
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Routing components for defining and rendering routes
import routes from "../routes"; // Array of route definitions
import { Suspense, lazy } from "react"; // React Suspense for lazy-loading components
import SuspenseContent from "./SuspenseContent"; // Fallback content shown during lazy loading
import { useSelector } from "react-redux"; // Hook for accessing the Redux store
import { useEffect, useRef } from "react"; // React hooks for side effects and DOM references

const Page404 = lazy(() => import("../pages/protected/404")); // Lazily load the 404 error page

function PageContent() {
  const mainContentRef = useRef(null); // Reference to the main content container
  const { pageTitle } = useSelector((state) => state.header); // Retrieve the current page title from the Redux `header` slice

  // Scroll back to the top of the page whenever the page title changes
  useEffect(() => {
    mainContentRef.current.scroll({
      top: 0,
      behavior: "smooth", // Smooth scrolling for better user experience
    });
  }, [pageTitle]); // Dependency array ensures this runs only when `pageTitle` changes

  return (
    <div className="drawer-content flex flex-col h-screen">
      {/* Header always visible at the top */}
      <Header />

      {/* Main content area */}
      <main
        className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200"
        ref={mainContentRef} // Attach the ref for scrolling logic
      >
        {/* Suspense provides a fallback while loading components lazily */}
        <Suspense fallback={<SuspenseContent />}>
          <Routes>
            {/* Map over routes array to dynamically create Route components */}
            {routes.map((route, key) => {
              return (
                <Route
                  key={key} // Unique key for each route
                  exact={true} // Match exact paths
                  path={`${route.path}`} // Path defined in the route object
                  element={<route.component />} // Component to render for the route
                />
              );
            })}

            {/* Catch-all route for undefined paths, rendering the 404 page */}
            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>

        {/* Bottom spacing to prevent content from being cut off */}
        <div className="h-16"></div>
      </main>
    </div>
  );
}

export default PageContent;
