import { Button, Card, Sidebar } from "flowbite-react";
import { NavBar } from "./NavBar";
import { UserIcon, Cog6ToothIcon, WalletIcon } from "@heroicons/react/24/solid";
import { useContext, useState } from "react";
import { AuthUserContext } from "./AuthUserContext";
import { Navigate } from "react-router-dom";

type Tab = "settings" | "edit" | "upgrade" | "billing";

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const { authUser } = useContext(AuthUserContext);

  const handleClick = (e: any) => {
    setActiveTab(e.target.id);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "settings": {
        return (
          <Button className="w-fit self-center" color={"failure"} size={"lg"}>
            Delete Account
          </Button>
        );
      }
      default: {
        return (
          <div className="text-lg text-center font-bold">Coming Soon 🚀</div>
        );
      }
    }
  };

  return (
    <div className="h-screen dark:bg-gray-800 dark:text-gray-200">
      {authUser === null && <Navigate to={"/"} />}
      <NavBar />
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <aside
        id="default-sidebar"
        className="fixed top-[70px] left-0 border-t-2 border-gray-800 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <ul className="space-y-2">
            <li>
              <a
                id="settings"
                onClick={handleClick}
                className="flex items-center gap-2 p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Cog6ToothIcon className="h-6 text-gray-200" />
                Settings
              </a>
            </li>
            <li>
              <a
                id="edit"
                onClick={handleClick}
                className="flex items-center gap-2 p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="h-6 text-gray-200" />
                Edit Profile
              </a>
            </li>
            <li>
              <a
                id="upgrade"
                onClick={handleClick}
                className="flex items-center gap-2 p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-5 h-5transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white dark:text-gray-200"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="gem"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M378.7 32H133.3L256 182.7L378.7 32zM512 192l-107.4-141.3L289.6 192H512zM107.4 50.67L0 192h222.4L107.4 50.67zM244.3 474.9C247.3 478.2 251.6 480 256 480s8.653-1.828 11.67-5.062L510.6 224H1.365L244.3 474.9z"
                  ></path>
                </svg>
                Upgrade to Pro
              </a>
            </li>
            <li>
              <a
                id="billing"
                onClick={handleClick}
                className="flex items-center gap-2 p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <WalletIcon className="h-6 text-gray-200" />
                Billing
              </a>
            </li>
          </ul>
        </div>
      </aside>
      <div className="h-screen w-full py-10 md:pl-64 flex justify-center items-center dark:bg-gray-800 dark:text-gray-200">
        <Card className="dark:bg-gray-900 dark:border-gray-900 -mt-[68px] w-[70%] h-[80%]">
          {renderTab()}
        </Card>
      </div>
    </div>
  );
};
