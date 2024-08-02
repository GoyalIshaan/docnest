import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Root from "./Root";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import Docs from "./pages/Docs";
import DocumentEditPage from "./pages/DocEdit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/docs",
        element: (
          <ProtectedRoute>
            <Docs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/docs/:id",
        element: (
          <ProtectedRoute>
            <DocumentEditPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  );
};

export default App;
