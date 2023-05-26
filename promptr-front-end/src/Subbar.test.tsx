import { fireEvent, screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SubBar } from "./SubBar";
import SocketServerMock from "socket.io-mock-ts";
import { SocketContext } from "./SocketContext";

let mockSocket: SocketServerMock;

beforeAll(() => {
  mockSocket = new SocketServerMock();
});

test("loads and displays all buttons", async () => {
  // Arrange
  render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <SubBar />
    </SocketContext.Provider>
  );
  const nullRadio = screen.getByRole("radio", { name: /Null/i });
  const shakespeareRadio = screen.getByRole("radio", { name: /Shakespeare/i });
  const googleCloudRadio = screen.getByRole("radio", { name: /Google Cloud/i });
  const parrotRadio = screen.getByRole("radio", { name: /Parrot/i });
  const gptScienceRadio = screen.getByRole("radio", { name: /GPT Science/i });
  const gptCodingRadio = screen.getByRole("radio", { name: /GPT Coding/i });
  // Assert
  expect(nullRadio.nextSibling?.firstChild?.firstChild?.textContent).toBe(
    "Null"
  );
  expect(
    shakespeareRadio.nextSibling?.firstChild?.firstChild?.textContent
  ).toBe("Shakespeare");
  expect(
    googleCloudRadio.nextSibling?.firstChild?.firstChild?.textContent
  ).toBe("Google Cloud");
  expect(parrotRadio.nextSibling?.firstChild?.firstChild?.textContent).toBe(
    "Parrot"
  );
  expect(gptScienceRadio.nextSibling?.firstChild?.firstChild?.textContent).toBe(
    "GPT Science"
  );
  expect(gptCodingRadio.nextSibling?.firstChild?.firstChild?.textContent).toBe(
    "GPT Coding"
  );
});

test("transcription buttons should click", async () => {
  // Arrange
  render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <SubBar />
    </SocketContext.Provider>
  );
  const nullRadio = screen.getByRole("radio", {
    name: /Null/i,
  }) as HTMLInputElement;
  const shakespeareRadio = screen.getByRole("radio", {
    name: /Shakespeare/i,
  }) as HTMLInputElement;
  const googleCloudRadio = screen.getByRole("radio", {
    name: /Google Cloud/i,
  }) as HTMLInputElement;

  // Act / Assert

  const nullRadioData = await new Promise((resolve) => {
    mockSocket.on("set_transcriber", (message: string) => {
      resolve(message);
    });
    fireEvent.click(nullRadio);
  });
  expect(nullRadioData).toBe("null");
  expect(nullRadio.checked).toBe(true);
  expect(shakespeareRadio.checked).toBe(false);
  expect(googleCloudRadio.checked).toBe(false);

  const shakespeareRadioData = await new Promise((resolve) => {
    mockSocket.on("set_transcriber", (message: string) => {
      resolve(message);
    });
    fireEvent.click(shakespeareRadio);
  });
  expect(shakespeareRadioData).toBe("shakespeare");
  expect(nullRadio.checked).toBe(false);
  expect(shakespeareRadio.checked).toBe(true);
  expect(googleCloudRadio.checked).toBe(false);

  const googleCloudRadioData = await new Promise((resolve) => {
    mockSocket.on("set_transcriber", (message: string) => {
      resolve(message);
    });
    fireEvent.click(googleCloudRadio);
  });
  expect(googleCloudRadioData).toBe("googlecloud");
  expect(nullRadio.checked).toBe(false);
  expect(shakespeareRadio.checked).toBe(false);
  expect(googleCloudRadio.checked).toBe(true);
});

test("response buttons should click", async () => {
  // Arrange
  render(
    <SocketContext.Provider value={mockSocket.clientMock}>
      <SubBar />
    </SocketContext.Provider>
  );
  const parrotRadio = screen.getByRole("radio", {
    name: /Parrot/i,
  }) as HTMLInputElement;
  const gptScienceRadio = screen.getByRole("radio", {
    name: /GPT Science/i,
  }) as HTMLInputElement;
  const gptCodingRadio = screen.getByRole("radio", {
    name: /GPT Coding/i,
  }) as HTMLInputElement;

  const parrotRadioData = await new Promise((resolve) => {
    mockSocket.on("set_response_generator", (message: string) => {
      resolve(message);
    });
    fireEvent.click(parrotRadio);
  });
  expect(parrotRadioData).toBe("parrot");
  expect(parrotRadio.checked).toBe(true);
  expect(gptScienceRadio.checked).toBe(false);
  expect(gptCodingRadio.checked).toBe(false);

  const gptScienceRadioData = await new Promise((resolve) => {
    mockSocket.on("set_response_generator", (message: string) => {
      resolve(message);
    });
    fireEvent.click(gptScienceRadio);
  });
  expect(gptScienceRadioData).toBe("gptscience");
  expect(parrotRadio.checked).toBe(false);
  expect(gptScienceRadio.checked).toBe(true);
  expect(gptCodingRadio.checked).toBe(false);

  const gptCodingRadioData = await new Promise((resolve) => {
    mockSocket.on("set_response_generator", (message: string) => {
      resolve(message);
    });
    fireEvent.click(gptCodingRadio);
  });
  expect(gptCodingRadioData).toBe("gptcoding");
  expect(parrotRadio.checked).toBe(false);
  expect(gptScienceRadio.checked).toBe(false);
  expect(gptCodingRadio.checked).toBe(true);
});
