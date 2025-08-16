import { Suspense, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import store from "./app/store.js";
import { Provider } from "react-redux";
import SuspenseContent from "./containers/SuspenseContent";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<SuspenseContent />}>
        <App />
      </Suspense>
    </Provider>
  </StrictMode>
);
