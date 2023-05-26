import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import { useContext, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { AuthUser, AuthUserContext } from "./AuthUserContext";
import config from "./config";
import { NavBar } from "./NavBar";

export const GetStarted: React.FC = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    repeatPassword: "",
    isAgree: false,
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    repeatPassword: "",
    isAgree: "",
  });
  const [passwordShown, setPasswordShown] = useState(false);
  const [repeatedPasswordShown, setRepeatedPasswordShown] = useState(false);
  const { setAuthUser } = useContext(AuthUserContext);
  const navigate = useNavigate();

  const validate = (id: keyof typeof user) => {
    let isValid = true;
    setErrors((prev) => {
      return { ...prev, [id]: "" };
    });

    switch (id) {
      case "fullName": {
        if (user[id] === "") {
          isValid = false;
          setErrors((prev) => {
            return { ...prev, [id]: "Full Name must not be empty" };
          });
        }
        break;
      }
      case "email": {
        if (user[id] === "") {
          isValid = false;
          setErrors((prev) => {
            return { ...prev, [id]: "Email must not be empty" };
          });
        }
        const pattern =
          /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;

        if (!pattern.test(user.email)) {
          setErrors((prev) => {
            return {
              ...prev,
              email: "Please enter a valid email",
            };
          });
          isValid = false;
        }
        break;
      }
      case "password": {
        if (user[id] === "") {
          isValid = false;
          setErrors((prev) => {
            return { ...prev, [id]: "Password must not be empty" };
          });
        }
        if (user.password.length < 8) {
          setErrors((prev) => {
            return {
              ...prev,
              password: "Minimum length of 8 characters is required",
            };
          });
          isValid = false;
        }
        break;
      }
      case "repeatPassword": {
        if (user[id] === "") {
          isValid = false;
          setErrors((prev) => {
            return { ...prev, [id]: "Repeated Password must not be empty" };
          });
        }
        if (user.password !== user.repeatPassword) {
          setErrors((prev) => {
            return { ...prev, repeatPassword: "Passwords must match" };
          });
          isValid = false;
        }
        break;
      }
      case "isAgree": {
        if (user[id] === false) {
          isValid = false;
          setErrors((prev) => {
            return { ...prev, [id]: "Must agree to terms and condititions" };
          });
        }
      }
    }
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    let isValid = true;
    for (let [key] of Object.entries(user)) {
      if (!validate(key as keyof typeof user)) {
        console.log(user, errors);
        isValid = false;
      }
    }

    if (isValid) {
      try {
        const response = await fetch(config.API_URL + "/create_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        const responseData = await response.json();
        setAuthUser(responseData as AuthUser);
        localStorage.setItem("authUser", JSON.stringify(responseData));
        navigate("../");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validate(e.target.id as keyof typeof user);
    return setUser({ ...user, [e.target.id]: e.target.value });
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    return setUser((prev) => {
      return { ...prev, isAgree: !prev.isAgree };
    });
  };

  return (
    <>
      <NavBar />
      <div className="h-screen dark:bg-gray-700 dark:text-gray-200 flex justify-center items-center p-3">
        <Card className="p-7 px-[4rem] -mt-10">
          <div className="text-3xl font-semibold text-center">
            Create a Promptr Account
          </div>
          <form
            className="flex flex-col gap-4 md:w-full mt-3"
            onSubmit={() => {
              return false;
            }}
          >
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="fullName"
                  value="Your Full Name"
                  color={errors.fullName !== "" ? "failure" : undefined}
                />
              </div>
              <TextInput
                id="fullName"
                type="name"
                placeholder="Full Name"
                shadow={true}
                value={user.fullName}
                onChange={handleChange}
                onBlur={handleChange}
                color={errors.fullName !== "" ? "failure" : undefined}
                helperText={errors.fullName}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="email"
                  value="Your email"
                  color={errors.email !== "" ? "failure" : undefined}
                />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="Email"
                shadow={true}
                value={user.email}
                onChange={handleChange}
                onBlur={handleChange}
                helperText={errors.email}
                color={errors.email !== "" ? "failure" : undefined}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="password"
                  value="Your password"
                  color={errors.password !== "" ? "failure" : undefined}
                />
              </div>
              <div className="relative">
                <TextInput
                  id="password"
                  type={passwordShown ? "text" : "password"}
                  placeholder="Minimum of 8 characters"
                  shadow={true}
                  value={user.password}
                  onChange={handleChange}
                  onBlur={handleChange}
                  helperText={errors.password}
                  color={errors.password !== "" ? "failure" : undefined}
                />
                <div className="absolute top-[9px] right-[12px]">
                  {passwordShown ? (
                    <EyeIcon
                      onClick={() => setPasswordShown(false)}
                      className="h-6 text-gray-500"
                    />
                  ) : (
                    <EyeSlashIcon
                      onClick={() => setPasswordShown(true)}
                      className="h-6 text-gray-500"
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="repeatPassword"
                  value="Repeat password"
                  color={errors.repeatPassword !== "" ? "failure" : undefined}
                />
              </div>
              <div className="relative">
                <TextInput
                  id="repeatPassword"
                  type={repeatedPasswordShown ? "text" : "password"}
                  shadow={true}
                  value={user.repeatPassword}
                  onChange={handleChange}
                  onBlur={handleChange}
                  helperText={errors.repeatPassword}
                  color={errors.repeatPassword !== "" ? "failure" : undefined}
                />
                <div className="absolute top-[9px] right-[12px]">
                  {repeatedPasswordShown ? (
                    <EyeIcon
                      onClick={() => setRepeatedPasswordShown(false)}
                      className="h-6 text-gray-500"
                    />
                  ) : (
                    <EyeSlashIcon
                      onClick={() => setRepeatedPasswordShown(true)}
                      className="h-6 text-gray-500"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isAgree"
                required
                checked={user.isAgree}
                onChange={() => {}}
                onClick={handleClick}
              />
              <Label htmlFor="isAgree">
                I agree with the{" "}
                <a className="text-blue-600 hover:underline dark:text-blue-500">
                  terms and conditions
                </a>
              </Label>
            </div>
            <Label
              id="error-checkbox-text"
              color={errors.isAgree !== "" ? "failure" : undefined}
              className={"-mt-2"}
            >
              {errors.isAgree}
            </Label>
            <Button
              gradientMonochrome="info"
              type="submit"
              size={"lg"}
              onClick={(
                e:
                  | React.FormEvent<HTMLFormElement>
                  | React.MouseEvent<HTMLButtonElement>
              ) => handleSubmit(e)}
            >
              Register
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};
