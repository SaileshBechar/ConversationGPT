import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Select } from "flowbite-react";

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

export const LanguageDropdown: React.FC<Props> = ({ socket }) => {
  const options = [
    "English (US)",
    "English (UK)",
    "French (CA)",
    "French (FR)",
    "Spanish (US)",
    "Hindi (IN)",
    "Japanese (JP)",
    "Korean (SK)",
  ];

  const [selected, setSelected] = useState(options[0]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    const data = { lang: e.target.value };
    socket.emit("send_language_change_to_backend", data);
  };

  return (
    <Select
      id="languages"
      required={true}
      value={selected}
      onChange={handleChange}
      className={"mr-2 py-2.5"}
      color="gray"
      shadow={true}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
};

export default LanguageDropdown;
