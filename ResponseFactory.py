from flask import request
import ResponseGenerator
import tokens

def create(response_engine_selected :str, uid: str, socketio, language = "en"):
    if response_engine_selected.lower() == 'gptscience':
        return ResponseGenerator.GPT_Science(token = tokens.EMMETT_OPENAI_API_KEY, uid = uid, socketio = socketio, response_engine_selected=response_engine_selected, language=language)
    elif response_engine_selected.lower() == 'gptcoding':
        return ResponseGenerator.GPT_Coding(token = tokens.EMMETT_OPENAI_API_KEY, uid = uid, socketio = socketio, response_engine_selected=response_engine_selected, language=language)
    elif response_engine_selected.lower() == 'parrot':
        return ResponseGenerator.Parrot(uid = uid, socketio = socketio)
    else:
        return ResponseGenerator.Parrot(uid = uid, socketio = socketio)