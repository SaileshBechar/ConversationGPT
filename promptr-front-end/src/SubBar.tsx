import { useContext, useState } from "react";
import config from "./config";
import LanguageDropdown from "./LanguageDropdown";
import { SocketContext } from "./SocketContext";

export const SubBar: React.FC = () => {
  const [transcribers, setTranscribers] = useState({
    null: false,
    shakespeare: false,
    googlecloud: true,
  });
  const [responders, setResponders] = useState({
    parrot: false,
    gptscience: true,
    gptcoding: false,
  });
  const socket = useContext(SocketContext);

  // Retrieve selected radio button from respective state
  const set_radio_button = (
    state: typeof responders | typeof transcribers,
    setState: typeof setResponders | typeof setTranscribers,
    id: string
  ) => {
    setState((prev: any) => {
      let temp = { ...prev };
      for (let [key] of Object.entries(state)) {
        temp = { ...temp, [key]: id === key };
      }
      return temp;
    });
  };

  // Handles change of transcription radio buttons
  const change_transcriber_state = (e: React.FormEvent<HTMLInputElement>) => {
    const id = e.currentTarget.id;
    set_radio_button(transcribers, setTranscribers, id);
    socket.emit("set_transcriber", id);
  };

  // Handles change of response engine radio buttons
  const change_responders_state = (e: React.FormEvent<HTMLInputElement>) => {
    const id = e.currentTarget.id;
    set_radio_button(responders, setResponders, id);
    socket.emit("set_response_generator", id);
  };

  // TODO: add cookie support

  return (
    <div className="w-full flex flex-col md:flex-row justify-between px-5 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-400">
      <div className="flex justify-center">
        <LanguageDropdown socket={socket} />
        {config.IS_DEBUG && (
          <>
            <div className="flex items-center py-2 md:pl-3">
              <input
                type="radio"
                id="null"
                name="transcription"
                value="null"
                className="hidden peer"
                onChange={change_transcriber_state}
                checked={transcribers.null}
                required
              />
              <label
                htmlFor="null"
                className="mr-2 inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-gray-200 peer-checked:border-gray-200 peer-checked:text-gray-200 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">Null</div>
                </div>
              </label>
            </div>
            <div className="flex items-center py-2">
              <input
                type="radio"
                id="shakespeare"
                name="transcription"
                value="shakespeare"
                className="hidden peer"
                onChange={change_transcriber_state}
                checked={transcribers.shakespeare}
                required
              />
              <label
                htmlFor="shakespeare"
                className="mr-2 inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-400 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    Shakespeare
                  </div>
                </div>
              </label>
            </div>
            <div className="flex items-center py-2">
              <input
                type="radio"
                id="googlecloud"
                name="transcription"
                value="googlecloud"
                className="hidden peer"
                onChange={change_transcriber_state}
                checked={transcribers.googlecloud}
                required
              />
              <label
                htmlFor="googlecloud"
                className="inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-pink-400 peer-checked:border-pink-500 peer-checked:text-pink-500 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="hidden md:block">
                  <div className="w-full text-lg font-semibold">
                    Google Cloud
                  </div>
                </div>
                <div className="block md:hidden">
                  <div className="text-lg font-semibold">Cloud</div>
                </div>
              </label>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-center">
        {config.IS_DEBUG && (
          <div className="flex items-center py-2">
            <input
              type="radio"
              id="parrot"
              name="prediction"
              value="parrot"
              className="hidden peer"
              onChange={change_responders_state}
              checked={responders.parrot}
              required
            />
            <label
              htmlFor="parrot"
              className="inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-yellow-300 peer-checked:border-yellow-300 peer-checked:text-yellow-300 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div className="block">
                <div className="w-full text-lg font-semibold">Parrot</div>
              </div>
            </label>
          </div>
        )}
        <div className="flex items-center py-2">
          <input
            type="radio"
            id="gptscience"
            name="prediction"
            value="gptscience"
            className="hidden peer"
            onChange={change_responders_state}
            checked={responders.gptscience}
            required
          />
          <label
            htmlFor="gptscience"
            className="mx-2 inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-green-300 peer-checked:border-green-400 peer-checked:text-green-300 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="hidden md:block">
              <div className="w-full text-lg font-semibold">GPT Science</div>
            </div>
            <div className="block md:hidden">
              <div className="w-full text-lg font-semibold">Science</div>
            </div>
          </label>
        </div>
        <div className="flex items-center py-2 md:pr-3">
          <input
            type="radio"
            id="gptcoding"
            name="prediction"
            value="gptcoding"
            className="hidden peer"
            onChange={change_responders_state}
            checked={responders.gptcoding}
            required
          />
          <label
            htmlFor="gptcoding"
            className="inline-flex items-center justify-center px-2 md:px-10 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-cyan-400 peer-checked:border-cyan-500 peer-checked:text-cyan-400 hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="hidden md:block">
              <div className="w-full text-lg font-semibold">GPT Coding</div>
            </div>
            <div className="block md:hidden">
              <div className="w-full text-lg font-semibold">Coding</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
