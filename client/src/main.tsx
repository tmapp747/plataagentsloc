import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import ApplicationPage from "./pages/ApplicationPage";
import ResumeApplication from "./pages/ResumeApplication";
import NotFound from "./pages/not-found";
import EmbedForm from "./pages/EmbedForm";
import AdminPanel from "./pages/AdminPanel";
import FormTester from "./pages/FormTester";
import VideoDemo from "./pages/VideoDemo";

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
      {
        path: "embed",
        element: <EmbedForm />,
      },
      {
        path: "admin",
        element: <AdminPanel />,
      },
      {
        path: "test",
        element: <FormTester />,
      },
      {
        path: "video-demo",
        element: <VideoDemo />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
