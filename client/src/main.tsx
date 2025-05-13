import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import ApplicationPage from "./pages/ApplicationPage";
import ResumeApplication from "./pages/ResumeApplication";
import NotFound from "./pages/not-found";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "application/:applicationId",
        element: <ApplicationPage />,
      },
      {
        path: "resume/:token",
        element: <ResumeApplication />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
