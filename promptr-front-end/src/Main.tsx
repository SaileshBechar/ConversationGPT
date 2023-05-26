import React, { useContext, useEffect } from "react";
import "./App.css";
import { AuthUserContext } from "./AuthUserContext";
import { Content } from "./Content";
import { NavBar } from "./NavBar";
import { SignInModal } from "./SignInCard";
import { SubBar } from "./SubBar";

const Main: React.FC = () => {
  const { authUser, setAuthUser } = useContext(AuthUserContext);
  const localUser = localStorage.getItem("authUser");
  // TODO: refactor by checking for valid user/ session in backend
  // if (localUser) {
  //   setAuthUser(JSON.parse(localUser));
  // }
  useEffect(() => {
    if (localUser) {
      setAuthUser(JSON.parse(localUser));
    }
  }, []);

  return (
    <div className="dark:bg-gray-700 min-h-screen">
      <NavBar></NavBar>
      {authUser !== null ? (
        <>
          <SubBar></SubBar>
          <Content></Content>
        </>
      ) : (
        <SignInModal />
      )}
    </div>
  );
};

export default Main;
