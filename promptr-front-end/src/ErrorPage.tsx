import { Button, Card } from "flowbite-react";
import { Link, useRouteError } from "react-router-dom";

export const ErrorPage: React.FC = () => {
  const error: any = useRouteError();
  console.error(error);

  return (
    <div className="h-screen flex justify-center items-center dark:bg-gray-800 dark:text-gray-200">
      <Card className="dark:bg-gray-900 max-w-md">
        <div className="flex-col justify-center items-center">
          <h1 className="text-2xl flex justify-center">Oops!</h1>
          <p className="text-lg flex justify-center my-4">
            Sorry, an unexpected error has occurred.
          </p>
          <p className="text-lg flex justify-center">
            <i>{error.statusText || error.message}</i>
          </p>
          <Link to="/">
            <Button className="mt-4 w-full" gradientMonochrome="info">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
