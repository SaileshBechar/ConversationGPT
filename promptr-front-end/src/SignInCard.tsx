import { useContext, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Label,
  TextInput,
} from "flowbite-react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import config from "./config";
import { AuthUserContext } from "./AuthUserContext";

export const SignInModal: React.FC = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { setAuthUser } = useContext(AuthUserContext);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setErrorMsg("Invalid credentials");
    try {
      const response = await fetch(config.API_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const responseData = await response.json();
      if (responseData === "Login failed") {
        console.log("Login failed");
      } else {
        setAuthUser(responseData);
        localStorage.setItem("authUser", JSON.stringify(responseData));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-7 -mt-10">
        <div className="space-y-6 px-6  lg:px-8  ">
          <h3 className="text-3xl px-5 font-medium text-gray-900 dark:text-white">
            Sign in to Promptr
          </h3>
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="email" value="Your email" />
            </div>
            <TextInput
              id="email"
              placeholder="name@company.com"
              required={true}
              value={user.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                return setUser({ ...user, email: e.target.value });
              }}
            />
          </div>
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="password" value="Your password" />
            </div>
            <TextInput
              id="password"
              type="password"
              required={true}
              value={user.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                return setUser({ ...user, password: e.target.value });
              }}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={user.remember}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  return setUser({ ...user, remember: e.target.checked });
                }}
              />
              <Label htmlFor="remember">Remember me</Label>
            </div>
          </div>
          {errorMsg && (
            <Alert color="failure">
              <span>
                <span className="font-medium flex items-center">
                  <ExclamationCircleIcon
                    strokeWidth={"2"}
                    className="h-6 dark:text-red-400 mr-2"
                  />
                  {errorMsg}
                </span>
              </span>
            </Alert>
          )}
          <div>
            <Button
              gradientMonochrome="info"
              type="submit"
              size={"lg"}
              onClick={handleSubmit}
              className={"w-full"}
            >
              Log in
            </Button>
          </div>
          <div className="text-sm font-medium text-center text-gray-500 dark:text-gray-300">
            Not registered?{" "}
            <Link
              to="/getStarted"
              className="text-blue-700 hover:underline dark:text-blue-500"
            >
              Create account
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
