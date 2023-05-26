import { Dropdown, Navbar } from "flowbite-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthUserContext } from "./AuthUserContext";
import config from "./config";
import logo from "./assets/promptr_logo.png";

export const NavBar: React.FC = () => {
  const { authUser, setAuthUser } = useContext(AuthUserContext);

  const handleLogout = async () => {
    try {
      const response = await fetch(config.API_URL + "/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      await response;
      setAuthUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Navbar fluid={true} className={"dark:bg-gray-900"}>
      <Link to={"/"}>
        <Navbar.Brand className="ml-4">
          <img
            src={logo}
            className="mr-0.5 h-6 sm:h-9 px-2 pt-1.5"
            alt="Promptr Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Promptr
          </span>
        </Navbar.Brand>
      </Link>
      {authUser && (
        <div className="mr-4 text-gray-200">
          <Dropdown
            label={`Welcome, ${authUser.fullName.split(" ")[0]}`}
            size={"lg"}
            gradientMonochrome="gray-200"
          >
            <Dropdown.Header>
              <span className="block text-sm">{authUser.fullName}</span>
              <span className="block text-sm font-medium truncate">
                {authUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/profile"}>
              <Dropdown.Item>Settings</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
          </Dropdown>
        </div>
      )}
    </Navbar>
  );
};
