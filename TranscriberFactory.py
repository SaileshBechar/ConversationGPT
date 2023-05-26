from flask import request
import Transcriber
import tokens

def create(transcript_engine_selected: str, uid: str, socketio, transcribertype, lang = 'en-US'):
    if transcript_engine_selected.lower() == 'googlecloud':
        return Transcriber.GoogleCloud(key_filename = tokens.EMMETT_GOOGLE_CLOUD_KEY_FILE, uid = uid, socketio = socketio, lang = lang, transcribertype=transcribertype)
    if transcript_engine_selected.lower() == 'shakespeare':
        return Transcriber.Shakespeare(uid = uid, socketio = socketio)
    else:
        return Transcriber.Null(uid = uid, socketio = socketio)