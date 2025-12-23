import { Suspense, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import store from "./app/store.js";
import { Provider } from "react-redux";
import SuspenseContent from "./containers/SuspenseContent";
import ErrorBoundary from "./components/Common/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <Suspense fallback={<SuspenseContent />}>
          <App />
        </Suspense>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
