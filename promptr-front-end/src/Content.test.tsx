import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Content } from "./Content";
import SocketServerMock from "socket.io-mock-ts";
import userEvent from "@testing-library/user-event";
import { SocketContext } from "./SocketContext";
import { AuthUserContext } from "./AuthUserContext";

let authProps: {
  user?: any;
  authUser?: { fullName: string; email: string };
  setAuthUser?: jest.Mock<void, [user: any]>;
};
let mockSocket: SocketServerMock;

beforeEach(() => {
  authProps = {
    authUser: { fullName: "Test User", email: "test@user.com" },
    setAuthUser: jest.fn(function (user) {
      authProps.user = user;
    }),
  };
  mockSocket = new SocketServerMock();
});

test("components are rendered on load", async () => {
  // Arrange
  const mockMediaDevices = {
    getUserMedia: jest.fn().mockResolvedValueOnce("fake data" as any),
  };
  Object.defineProperty(window.navigator, "mediaDevices", {
    writable: true,
    value: mockMediaDevices,
  });

  const { getByTestId } = render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <AuthUserContext.Provider value={authProps}>
        <Content />
      </AuthUserContext.Provider>
    </SocketContext.Provider>
  );
  const transcriptionBox = await getByTestId("transcription-box");

  // Assert
  expect(transcriptionBox.hasChildNodes()).toBe(false);
  expect(
    screen.getByRole("heading", { name: /Welcome to Promptr/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Prompt/i })
  ).not.toBeInTheDocument();
});

test("transcription should display text and prompt", async () => {
  // Arrange
  const mockMediaDevices = {
    getUserMedia: jest.fn().mockResolvedValueOnce("fake data" as any),
  };
  Object.defineProperty(window.navigator, "mediaDevices", {
    writable: true,
    value: mockMediaDevices,
  });
  const user = userEvent.setup();
  render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <AuthUserContext.Provider value={authProps}>
        <Content />
      </AuthUserContext.Provider>
    </SocketContext.Provider>
  );
  const transcriptionBox = await screen.getByTestId("transcription-box");

  // Does text appear in transcription box and is prompt button visible
  act(() => {
    mockSocket.emit("send_client_transcription_to_frontend", {
      is_final: true,
      utterance: "testing 123",
    });
  });

  const promptButton = screen.getByRole("button", { name: /Prompt/i });
  expect(promptButton).toHaveTextContent("Prompt");
  expect(promptButton).toBeDisabled();
  expect(transcriptionBox.childNodes.length).toBeGreaterThan(0);

  // Does selection enable prompt button and send text to backend
  await user.pointer([
    { target: transcriptionBox, keys: "[MouseLeft>]", offset: 0 },
    { offset: 11 },
    { keys: "[/MouseLeft]" },
  ]);
  const selection = document.getSelection()?.toString();

  expect(selection).toBe("testing 123");
  expect(promptButton).not.toBeDisabled();

  const data = await new Promise((resolve) => {
    mockSocket.on("send_selection_data_to_backend", (message: string) => {
      resolve(message);
    });
    fireEvent.click(promptButton);
  });

  expect(data).toStrictEqual({ text: "testing 123", type: "prompt" });
});

test("response box should display text", async () => {
  // Arrange
  const mockMediaDevices = {
    getUserMedia: jest.fn().mockResolvedValueOnce("fake data" as any),
  };
  Object.defineProperty(window.navigator, "mediaDevices", {
    writable: true,
    value: mockMediaDevices,
  });
  render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <AuthUserContext.Provider value={authProps}>
        <Content />
      </AuthUserContext.Provider>
    </SocketContext.Provider>
  );

  // Act
  act(() => {
    mockSocket.emit("send_response_data_to_frontend", {
      title: "Test Title",
      text: "Test Description",
    });
  });

  // Assert
  expect(
    screen.queryByRole("heading", { name: /Welcome to Promptr/i })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /Test Title/i })
  ).toBeInTheDocument();
});
