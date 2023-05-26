import openai
import tokens
import queue
import re
from better_profanity import profanity
from googletrans import Translator

class ResponseGenerator:
    def __init__(self, uid, socketio, response_engine_selected, language="en"):
        self.response_engine_selected = response_engine_selected
        self.input_q = queue.Queue()
        self.stop = False
        self.socketio = socketio
        self.uid = uid
        self.language = language
        self.translator = None

    def get_last_input(self):
        while True:
            yield self.input_q.get()

    def emit_latest_response(self):
        gen = self.get_last_input()
        for data in gen:
            text = data["text"]
            response_type = data["type"]
            if (not self.stop) and (self.socketio is not None):
                responses = self.generate_responses(text, response_type)
                for response in responses:
                    self.socketio.emit(
                        "send_response_data_to_frontend", response, room=self.uid
                    )

    def destroy(self):
        self.stop = True

    def put_input(self, data):
        self.input_q.put(data)

    # lord forgive me for writing this code
    def sanitize(response, split: bool):
        text = profanity.censor(response)
        # make substitutions
        substitutions = {
            r"\begin{equation}": r"$",
            r"\end{equation}": r"$",
        }
        # remove triple newlines.
        for i in range(5): text = text.replace("\n\n\n", "\n\n")
        for search, sub in substitutions.items():
            text = text.replace(search, sub)
        if split:
            split_str = text.split('. ')
            if len(split_str) <= 1:
                return text.strip(), None
            if '```' in split_str[0]:
                return None, text.strip()
            title = split_str[0].strip() + '.'
            text = ('. '.join(split_str[1:])).strip()
            return title, text
        return text

class GPT_Science(ResponseGenerator):
    MAX_TOKENS = 1024

    def __init__(self, token: str, uid: str, socketio, response_engine_selected, language="en"):
        super().__init__(uid=uid, socketio=socketio, response_engine_selected=response_engine_selected, language=language)
        openai.api_key = tokens.EMMETT_OPENAI_API_KEY

    def generate_responses(self, text: str, response_type: str) -> str:
        responses = []
        if response_type == "expand":
            # use simplify then expand technique for best results
            prompt = f"A scientific topic has been given in the following square brackets: [{text}]. Please give an overview of the topic. Assume the reader has a graduate-level understanding of the topic. Give any equations in LaTeX $ tags if necessary."
        elif response_type == "simplify":
            prompt = f"A scientific topic is given in the following square brackets: [{text}]. Please give a very brief overview of it. Assume the reader has little understanding of the topic and wants a brief answer."
        elif response_type == "prompt":
            prompt = f"Information from a poorly transcribed scientific discussion is given in the following square brackets: [{text}]. Please write a brief, high quality contribution to the discussion. Give any equations in LaTeX $ tags if necessary."
        else:
            return [{"title": "Error", "text": "invalid response_type"}]
        # prompt = self.translator.translate(prompt, dest=self.language).text
        question_response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=self.MAX_TOKENS,
            temperature=0,
        )
        title, text = ResponseGenerator.sanitize(question_response.choices[0].text, split = True)
        responses.append({"title": title, "text": text})
        return responses


class GPT_Coding(ResponseGenerator):
    MAX_TOKENS = 1024

    def __init__(self, token: str, uid, socketio, response_engine_selected, language="en"):
        super().__init__(uid=uid, socketio=socketio, response_engine_selected=response_engine_selected, language=language)
        openai.api_key = tokens.EMMETT_OPENAI_API_KEY

    def generate_responses(self, text: str, response_type: str) -> str:
        responses = []
        #try:
        if response_type == "expand":
            prompt = f"A coding problem is given in the following square brackets: [{text}].  Please explain the solution to the problem in detail, and include code in ``` blocks when necessary."
        elif response_type == "simplify":
            prompt = f"A coding problem is given in the following square brackets: [{text}]. Please give a very brief and simple explanation of it. Assume that the reader is a beginner coder."
        elif response_type == "prompt":
            prompt = f"Poorly scanned text from a programming problem is given in the following square brackets: [{text}]. Please give a very brief explanation of how you could solve the problem, including samples of code in ``` blocks when necessary."
        else:
            return [{"title": "Error", "text": "invalid response_type"}]
        # prompt = self.translator.translate(prompt, dest=self.language).text
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=self.MAX_TOKENS,
            temperature=0,
        )
        title, text = ResponseGenerator.sanitize(response.choices[0].text, split = True)
        responses.append({"title": title, "text": text})
        return responses
        #except Exception as e:
        #    # do not want to treat this as error
        #    print(
        #        "Invalid response value: error retrieving response in GPT_Coding.get_response. Continuing anyways."
        #    )


class Parrot(ResponseGenerator):
    def __init__(self, uid, socketio):
        super().__init__(uid=uid, socketio=socketio, language="en")

    def generate_responses(self, text: str, response_type: str):
        return [
            {
                "title": "Parrotting",
                "text": response_type + ": " + ResponseGenerator.sanitize(text, split = False),
            }
        ]
