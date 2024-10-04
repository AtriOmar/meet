import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MeetProvider } from "@/contexts/MeetProvider";
import Meet from "@/pages/Meet";
import Home from "@/pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:id",
    element: <Meet />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <MeetProvider>
    <div className="fixed z-[-1] right-[200px] top-[100px] w-[100px] h-[500px] bg-slate-700 -rotate-45 blur-[100px]"></div>
    <div className="fixed z-[-1] right-[700px] top-[200px] w-[100px] h-[700px] bg-slate-700 -rotate-45 blur-[100px]"></div>
    <div className="fixed z-[-1] right-[1400px] top-[50px] w-[100px] h-[500px] bg-slate-700 -rotate-45 blur-[100px]"></div>
    <RouterProvider router={router} />
  </MeetProvider>
);
