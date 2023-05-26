import React, { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import { animateScroll } from "react-scroll";
import katex from "katex";
import { Card, Button, Spinner } from "flowbite-react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Prism } from "@mantine/prism";
import parser from "html-react-parser";
import { SocketContext } from "./SocketContext";

type CurrUtterance = {
  initialTimestamp: number;
  nonFinalUtterance: string;
  outdatedUtterances: string[];
  cachedUtterance: string;
};
const DEFAULT_UTTERANCE: CurrUtterance = {
  initialTimestamp: 0,
  nonFinalUtterance: "",
  outdatedUtterances: [],
  cachedUtterance: "",
};

// converts an array of floating point audio samples to a linear 16-bit PCM format.
const convertTo16BitPCM = (input: any) => {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff; // Gigabrain logic
  }
  return output;
};

function findAndFormatTex(blockArr: { type: string; content: string }[]) {
  const regex = /\$(.*?)\$/g;
  let match: RegExpExecArray | null;
  for (let block of blockArr) {
    if (block.type === "text") {
      while ((match = regex.exec(block.content)) !== null) {
        const tex = match[1];
        const formattedTex = katex.renderToString(tex);
        block.content = block.content.replace(`$${tex}$`, formattedTex);
      }
    }
  }
  return blockArr;
}

function formatTextAndCode(text: string) {
  let blockArr: { type: string; content: string }[] = [];
  let inCode = false;
  let currentText = "";

  // formats response into either being plaintext or a codeblock TY GPT <3
  for (let i = 0; i < text.length; i++) {
    if (!inCode && text.substring(i, i + 3) === "```") {
      inCode = true;
      // Removing uncessary whitespace around coding blocks
      while (currentText.charAt(0) === "\n") {
        currentText = currentText.substring(1);
      }
      while (currentText.charAt(currentText.length - 2) === "\n") {
        currentText = currentText.substring(0, currentText.length - 1);
      }
      blockArr.push({ type: "text", content: currentText });
      currentText = "";
      i += 2;
    } else if (inCode && text.substring(i, i + 3) === "```") {
      inCode = false;
      blockArr.push({ type: "code", content: currentText });
      currentText = "";
      i += 2;
    } else {
      currentText += text[i];
    }
  }
  // Hack, for if there is only one ``` in response
  if (currentText) {
    blockArr[blockArr.length - 1] = {
      ...blockArr[blockArr.length - 1],
      type: "code",
    };
    blockArr.push({ type: "text", content: currentText });
  }
  return blockArr;
}

function renderTextContent(text: string) {
  const blockArr = findAndFormatTex(formatTextAndCode(text));
  return blockArr.map((block: { type: string; content: string }, index) => {
    if (block.type === "code") {
      return (
        <Prism
          key={index}
          withLineNumbers
          colorScheme="dark"
          language="python"
          className="my-5"
        >
          {block.content}
        </Prism>
      );
    } else {
      return (
        <div className="whitespace-pre-wrap" key={index}>
          {parser(block.content)}
        </div>
      );
    }
  });
}

export const Content: React.FC = () => {
  const initCardData = {
    id: 0,
    title: "Welcome to Promptr",
    text: 'Simply highlight the text from the transcript that you would like to generate a prompt for and click the "Prompt" button.',
  };

  const [utteranceArr, setUtteranceArr] = useState<
    {
      finalUtterance: string;
      nonFinalUtterance: string;
      user: "client" | "desktop";
    }[]
  >([]);
  const [currClientUtt, setCurrClientUtt] =
    useState<CurrUtterance>(DEFAULT_UTTERANCE);
  const [currDesktopUtt, setCurrDesktopUtt] =
    useState<CurrUtterance>(DEFAULT_UTTERANCE);
  const [audioStream, setAudioStream] = useState<MediaStream>();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cardData, setCardData] = useState<typeof initCardData[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [isInit, setIsInit] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<number>(0);
  const [isScrollUp, setIsScrollUp] = useState<boolean>(false);

  const socket = useContext(SocketContext);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const currClientUttRef = useRef<HTMLSpanElement>(null);
  const currDesktopUttRef = useRef<HTMLSpanElement>(null);

  const addCard = (cardTitle: string, cardText: string) => {
    // Check to make sure (partial) code blocks do not appear in title
    if (cardTitle.includes("```")) {
      cardText = cardTitle + cardText;
      cardTitle = "";
    }

    const newCard = {
      id: cardData.length + 1,
      title: cardTitle,
      text: cardText,
    };

    setCardData((prev) => {
      return [...prev, newCard];
    });
    setIsThinking((prev) => {
      return prev - 1;
    });
    setIsInit(false);
  };

  const handleCardExpandClick = (text: string) => {
    // function to handle button click
    const data = {
      text: text,
      type: "expand",
    };
    socket.emit("send_selection_data_to_backend", data);
    setIsThinking((prev) => {
      return prev + 1;
    });
  };

  const handleCardSimplifyClick = (text: string) => {
    // function to handle button click
    const data = {
      text: text,
      type: "simplify",
    };
    socket.emit("send_selection_data_to_backend", data);
    setIsThinking((prev) => {
      return prev + 1;
    });
  };

  const handleScroll = () => {
    const maxScroll =
      (transcriptionRef.current?.scrollHeight || 0) -
      (transcriptionRef.current?.offsetHeight || 0);
    if ((transcriptionRef.current?.scrollTop || 0) + 100 < maxScroll) {
      setIsScrollUp(true);
    } else {
      setIsScrollUp(false);
    }
  };

  const handleScrollButtonClick = () => {
    setIsScrollUp(false);
    animateScroll.scrollToBottom({
      containerId: "transcription-box",
      duration: 100,
    });
  };

  const handleButtonClick = () => {
    const data = {
      text: selection?.toString(),
      type: "prompt",
    };
    socket.emit("send_selection_data_to_backend", data);
    window.getSelection()?.removeAllRanges();
    setIsButtonDisabled(true);
    setSelection(null);
    setIsThinking((prev) => {
      return prev + 1;
    });
  };

  const renderTranscriptionBox = () => {
    let utteranceArrPlusCurr = [
      ...utteranceArr,
      { ...currDesktopUtt, finalUtterance: "", user: "desktop" },
      { ...currClientUtt, finalUtterance: "", user: "client" },
    ];
    // Display client msg first if started earlier
    if (
      currClientUtt.initialTimestamp > 0 &&
      currDesktopUtt.initialTimestamp > 0 &&
      currClientUtt.initialTimestamp < currDesktopUtt.initialTimestamp
    ) {
      utteranceArrPlusCurr = [
        ...utteranceArr,
        { ...currClientUtt, finalUtterance: "", user: "client" },
        { ...currDesktopUtt, finalUtterance: "", user: "desktop" },
      ];
    }

    return utteranceArrPlusCurr.map((utterance, index) => {
      if (!(utterance.finalUtterance || utterance.nonFinalUtterance)) {
        return;
      }
      if (utterance.user === "desktop") {
        return (
          <div className="w-fit my-6 mr-8 p-4 bg-gradient-to-r from-green-900 to-emerald-600 rounded-lg shadow-lg transition-transform duration-300">
            <span
              key={index + utterance.finalUtterance}
              className={"dark:text-gray-200 "}
            >
              {utterance.finalUtterance}
            </span>
            <span
              key={index + utterance.nonFinalUtterance}
              className={"dark:text-gray-200 font-semibold"}
              ref={currDesktopUttRef}
            >
              {utterance.nonFinalUtterance}
            </span>
          </div>
        );
      } else {
        return (
          <div className="w-fit my-6 ml-auto p-4 bg-gradient-to-r from-cyan-800 to-sky-500 rounded-lg shadow-lg text-right transition-transform duration-300">
            <span
              key={index + utterance.finalUtterance}
              className={" dark:text-gray-200 "}
            >
              {utterance.finalUtterance}
            </span>
            <span
              key={index + utterance.nonFinalUtterance}
              className={"dark:text-gray-200 font-semibold"}
              ref={currClientUttRef}
            >
              {utterance.nonFinalUtterance}
            </span>
          </div>
        );
      }
    });
  };

  const groupUserUtterances = (
    dict_data: { is_final: boolean; utterance: string },
    user: "client" | "desktop",
    setCurrUserUtt: typeof setCurrClientUtt,
    currUserUttRef: typeof currClientUttRef
  ) => {
    // if selected, do not re-render current utterance
    if (
      document.getSelection()?.anchorNode?.parentNode === currUserUttRef.current
    ) {
      if (dict_data["is_final"]) {
        setCurrUserUtt((prev) => {
          return {
            ...prev,
            outdatedUtterances: [
              ...prev.outdatedUtterances,
              dict_data["utterance"],
            ],
          };
        });
      } else {
        setCurrUserUtt((prev) => {
          return { ...prev, cachedUtterance: dict_data["utterance"] };
        });
      }
    } else {
      // If Final, remove from curr utterance
      if (dict_data["is_final"]) {
        setCurrUserUtt(() => {
          return DEFAULT_UTTERANCE;
        });
        setUtteranceArr((prev) => {
          return [
            ...prev,
            {
              finalUtterance: dict_data["utterance"],
              nonFinalUtterance: "",
              user,
            },
          ];
        });
      }
      // If non final, only replace current utterance
      else {
        setCurrUserUtt((prev) => {
          if (prev.initialTimestamp === 0) {
            return {
              ...prev,
              initialTimestamp: Date.now(),
              nonFinalUtterance: dict_data["utterance"],
            };
          }
          return { ...prev, nonFinalUtterance: dict_data["utterance"] };
        });
      }
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on(
      "send_response_data_to_frontend",
      (dict_data: { title: string; text: string }) => {
        addCard(dict_data["title"], dict_data["text"]);
      }
    );

    // update transcription box when new data arrives from backend via socket
    socket.on(
      "send_client_transcription_to_frontend",
      (dict_data: { is_final: boolean; utterance: string }) => {
        groupUserUtterances(
          dict_data,
          "client",
          setCurrClientUtt,
          currClientUttRef
        );
      }
    );

    socket.on(
      "send_desktop_transcription_to_frontend",
      (dict_data: { is_final: boolean; utterance: string }) => {
        groupUserUtterances(
          dict_data,
          "desktop",
          setCurrDesktopUtt,
          currDesktopUttRef
        );
      }
    );

    // record from microphone and stream data to backend via socket
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        setAudioStream(stream);
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        microphone.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        scriptProcessor.onaudioprocess = (event) => {
          const audioData = event.inputBuffer.getChannelData(0);
          const audioData16 = convertTo16BitPCM(audioData);
          socket.emit("send_recording_data_to_backend", audioData16);
        };
      })
      .catch((error) => {
        console.log("Error Retirieving Audio:", error);
      });

    const handleSelection = () => {
      const currSelection = document.getSelection();
      if (currSelection) {
        setIsButtonDisabled(false);
        setSelection(currSelection);
      } else {
        setIsButtonDisabled(true);
      }
    };
    document.addEventListener("mouseup", handleSelection);

    return () => {
      console.log("Stopped listening");
      socket.off("connect");
      socket.off("send_client_transcription_to_frontend");
      document.removeEventListener("mouseup", handleSelection);
      audioStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isScrollUp) {
      animateScroll.scrollToBottom({
        containerId: "transcription-box",
        duration: 100,
      });
    }
  }, [utteranceArr, currClientUtt, currDesktopUtt]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "response-box",
      smooth: true,
    });
  }, [isThinking, cardData]);

  useEffect(() => {
    if (
      document.getSelection()?.anchorNode?.parentNode !==
        currDesktopUttRef.current &&
      (currDesktopUtt.cachedUtterance ||
        currDesktopUtt.outdatedUtterances.length > 0)
    ) {
      currDesktopUtt.outdatedUtterances.forEach((outdatedUtt) => {
        setUtteranceArr((prev) => {
          return [
            ...prev,
            {
              finalUtterance: outdatedUtt,
              nonFinalUtterance: "",
              user: "desktop",
            },
          ];
        });
      });
      setCurrDesktopUtt((prev) => {
        return {
          initialTimestamp: Date.now(),
          nonFinalUtterance: prev.cachedUtterance,
          cachedUtterance: "",
          outdatedUtterances: [],
        };
      });
    } else if (
      document.getSelection()?.anchorNode?.parentNode !==
        currClientUttRef.current &&
      (currClientUtt.cachedUtterance ||
        currClientUtt.outdatedUtterances.length > 0)
    ) {
      currClientUtt.outdatedUtterances.forEach((outdatedUtt) => {
        setUtteranceArr((prev) => {
          return [
            ...prev,
            {
              finalUtterance: outdatedUtt,
              nonFinalUtterance: "",
              user: "client",
            },
          ];
        });
      });
      setCurrClientUtt((prev) => {
        return {
          initialTimestamp: Date.now(),
          nonFinalUtterance: prev.cachedUtterance,
          cachedUtterance: "",
          outdatedUtterances: [],
        };
      });
    }
  });

  return (
    // TODO: refactor transcription box into own component
    <div className="flex flex-col justify-between md:flex-row p-4">
      <div
        id="transcription-container"
        className="w-full max-h-[50vh] md:max-h-full md:w-[calc(30%-0.5rem)] md:h-[calc(100vh-128px-3rem)] rounded-lg flex flex-col justify-between dark:bg-gray-800"
      >
        <div
          data-testid="transcription-box"
          id="transcription-box"
          ref={transcriptionRef}
          onScroll={handleScroll}
          className="overflow-auto p-6 dark:text-gray-200 text-lg"
        >
          {renderTranscriptionBox()}
        </div>
        <div className="relative flex justify-center">
          {isScrollUp && (
            <Button
              onClick={handleScrollButtonClick}
              className="absolute bottom-[1rem] inline-flex items-center justify-between"
              pill={true}
              gradientMonochrome="info"
            >
              <ArrowDownIcon strokeWidth={"3"} className="h-4 mx-1" />
            </Button>
          )}
        </div>
        {utteranceArr.length > 0 ||
        currClientUtt.nonFinalUtterance ||
        currDesktopUtt.nonFinalUtterance ? (
          <button
            disabled={isButtonDisabled}
            className="m-4 inline-flex items-center justify-center px-10 py-2 rounded-lg cursor-pointer border-2 text-xl disabled:cursor-not-allowed disabled:dark:lg:hover:bg-gray-800 disabled:dark:bg-gray-800 disabled:dark:border-gray-900 dark:border-gray-200 disabled:dark:text-gray-900 dark:text-gray-200 dark:bg-gray-800 dark:lg:hover:bg-gray-700 dark:disabled:shadow-none dark:shadow-sm dark:shadow-gray-500/80"
            onClick={handleButtonClick}
          >
            Prompt
          </button>
        ) : null}
      </div>
      {/* TODO: Refactor Response Box into own component */}
      <div
        id="response-box"
        className="w-full h-full md:w-[calc(70%-0.5rem)] md:h-[calc(100vh-128px-3rem)] rounded-lg text-lg p-6 pb-0 mt-4 md:m-0 overflow-auto bg-white dark:bg-gray-800 dark:text-gray-200"
      >
        {isInit && (
          <Card key={initCardData.id} className="scroll-mb-4 mb-4">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {initCardData.title}
            </h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              {initCardData.text}
            </p>
            <div className="inline-flex gap-3">
              <Button gradientMonochrome="cyan" outline={true}>
                <ArrowLeftIcon
                  strokeWidth={"3"}
                  className="h-4 mr-1 text-gray-200"
                />
                Start!
              </Button>
            </div>
          </Card>
        )}
        {cardData.map((card) => (
          <Card key={card.id} className="scroll-mb-4 mb-4">
            {card.title && (
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {findAndFormatTex([{ type: "text", content: card.title }]).map(
                  (block) => {
                    return parser(block.content);
                  }
                )}
              </h5>
            )}
            {card.text && (
              <div className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {renderTextContent(card.text)}
              </div>
            )}
            <div className="inline-flex gap-3">
              <Button
                onClick={() =>
                  handleCardExpandClick(card.title + ". " + card.text)
                }
                gradientMonochrome="cyan"
                outline={true}
              >
                Expand
                <ArrowRightIcon
                  strokeWidth={"3"}
                  className="h-4 mx-1 text-gray-200"
                />
              </Button>
              <Button
                onClick={() =>
                  handleCardSimplifyClick(card.title + ". " + card.text)
                }
                gradientMonochrome={`success`}
                outline={true}
              >
                Simplify
                <ArrowRightIcon strokeWidth={"3"} className="h-4 mx-1" />
              </Button>
            </div>
          </Card>
        ))}
        {isThinking > 0 && (
          <Card className="scroll-mb-4 mb-4 ">
            <div className="flex justify-start items-center">
              <Spinner aria-label="Large spinner example" size="lg" />
              <div className="text-xl ml-4">Thinking...</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
