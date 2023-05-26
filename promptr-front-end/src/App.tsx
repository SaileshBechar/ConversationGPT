import React, { useState } from "react";
import "./App.css";
import io from "socket.io-client";
import config from "./config";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthUserContext, AuthUser } from "./AuthUserContext";
import { ErrorPage } from "./ErrorPage";
import { GetStarted } from "./GetStarted";
import Main from "./Main";
import { SocketContext } from "./SocketContext";
import { Profile } from "./Profile";

export const routesConfig = [
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/getStarted",
    element: <GetStarted />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
    errorElement: <ErrorPage />,
  },
];

const router = createBrowserRouter(routesConfig);

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const socket = io(config.API_URL);
  return (
    <div className="dark">
      <SocketContext.Provider value={socket}>
        <AuthUserContext.Provider value={{ authUser, setAuthUser }}>
          <RouterProvider router={router} />
        </AuthUserContext.Provider>
      </SocketContext.Provider>
    </div>
  );
};

export default App;
