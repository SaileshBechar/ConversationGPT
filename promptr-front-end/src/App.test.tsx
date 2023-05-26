import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { GetStarted } from "./GetStarted";
import Main from "./Main";
import { AuthUser, AuthUserContext } from "./AuthUserContext";
import { useState } from "react";
import SocketServerMock from "socket.io-mock-ts";
import { SocketContext } from "./SocketContext";

let authProps: {
  user?: any;
  authUser?: { fullName: string };
  setAuthUser?: jest.Mock<void, [user: any]>;
};
let mockSocket: SocketServerMock;

beforeEach(() => {
  authProps = {
    authUser: { fullName: "Test User" },
    setAuthUser: jest.fn(function (user) {
      authProps.user = user;
    }),
  };
  mockSocket = new SocketServerMock();
});

test("full app rendering/navigating", async () => {
  const mockMediaDevices = {
    getUserMedia: jest.fn().mockResolvedValueOnce("fake data" as any),
  };
  Object.defineProperty(window.navigator, "mediaDevices", {
    writable: true,
    value: mockMediaDevices,
  });
  render(
    <AuthUserContext.Provider value={authProps}>
      <SocketContext.Provider value={mockSocket.clientMock}>
        <Main />
      </SocketContext.Provider>
    </AuthUserContext.Provider>,
    { wrapper: BrowserRouter }
  );
  // verify page content for default route
  expect(screen.getByText(/Welcome to Promptr/i)).toBeInTheDocument();
});

test("rendering GetStarted", () => {
  const route = "/getStarted";

  render(
    <MemoryRouter initialEntries={[route]}>
      <SocketContext.Provider value={mockSocket.clientMock}>
        <AuthUserContext.Provider value={authProps}>
          <GetStarted />
        </AuthUserContext.Provider>
      </SocketContext.Provider>
    </MemoryRouter>
  );

  // verify location display is rendered
  expect(screen.getByText(/Create a Promptr Account/i)).toBeInTheDocument();
});
