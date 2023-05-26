from gevent import monkey

monkey.patch_all()
import uuid
from flask import Flask, make_response, render_template, request, session, abort
from flask_socketio import SocketIO, join_room, leave_room
from flask_cors import CORS
import TranscriberFactory
import ResponseFactory
from engineio.payload import Payload
from flask_sqlalchemy import SQLAlchemy
import Database
import grpc.experimental.gevent
import logging

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

app = Flask(
    __name__,
    static_folder="promptr-front-end/build/static",
    template_folder="promptr-front-end/build",
)
app.config["SECRET_KEY"] = "secret!"
Payload.max_decode_packets = 500
socketio = SocketIO(app, async_mode="gevent", cors_allowed_origins="*")
CORS(app)

grpc.experimental.gevent.init_gevent()

transcribers = {}
response_generators = {}

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://postgres:password@localhost/promptr"

db = SQLAlchemy(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/create_user", methods=["POST"])
def create_user():
    try:
        data = request.get_json(force=True)
        name = data["fullName"]
        email = data["email"]
        password = data["password"]
        hashed_password = str(hash(str(password)))
        # check if they already exist
        existing_user = db.session.query(Database.User).filter_by(email=email).first()
        if existing_user is not None:
            abort(400, "Email already in use")
        # add user
        print("Good request", data)
        user = Database.User(name=name, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
    except KeyError:
        abort(400, "Missing required fields 'name' or 'password'")
    except TypeError:
        abort(400, "Invalid JSON")
    return data


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        email = data["email"]
        password = data["password"]
        hashed_password = str(hash(str(password)))
        user = db.session.query(Database.User).filter_by(email=email).first()
        print(user.name, user.email, user.password, hashed_password)
        if user is not None and user.password == hashed_password:
            return {"fullName": user.name, "email": user.email}
        else:
            return "Login failed"
    except KeyError:
        abort(400, "Missing required fields 'email' or 'password'")
    except TypeError:
        abort(400, "Invalid JSON")
    # Get Auth Token


@app.route("/logout", methods=["POST"])
def logout():
    # Get Auth Token
    return make_response("Success", 200)


@app.route("/<path:path>")
def catch_all(path):
    return render_template("index.html")


@socketio.on("connect")
def handle_connect(arg):
    session["uuid"] = str(uuid.uuid1())
    id = session["uuid"]
    join_room(id)

    # set default transcriber and responsegenerator
    transcribers[id] = {'client':TranscriberFactory.create(
        "googlecloud", uid=id, socketio=socketio, lang="en-US", transcribertype='client'
    ),
    'desktop': TranscriberFactory.create(
        "googlecloud", uid=id, socketio=socketio, lang="en-US", transcribertype='desktop'
    )}
    response_generators[id] = ResponseFactory.create(
        response_engine_selected="gptscience", uid=id, socketio=socketio, language="en"
    )

    socketio.start_background_task(transcribers[id]['client'].emit_latest_transcription)
    socketio.start_background_task(transcribers[id]['desktop'].emit_latest_transcription)
    socketio.start_background_task(response_generators[id].emit_latest_response)
    print(f"Client {id} connected")


@socketio.on("disconnect")
def handle_disconnect():
    global transcribers
    id = session["uuid"]
    leave_room(id)
    transcribers[id]['client'].destroy()
    transcribers[id]['desktop'].destroy()
    response_generators[id].destroy()
    del transcribers[id]
    del response_generators[id]
    print(f"Client {id} disconnected")


@socketio.on("send_recording_data_to_backend")
def handle_message(message):
    global transcribers
    id = session["uuid"]
    transcribers[id]['client'].put_audio(message)


@socketio.on("send_selection_data_to_backend")
def handle_message(message):
    global transcribers, response_generators
    id = session["uuid"]
    print(f"Client {id} sending selected text to backend...")
    response_generators[id].put_input(message)
    print(f"Client {id} sent selected text to backend")


@socketio.on("send_expand_data_to_backend")
def handle_message(message):
    global transcribers, response_generators
    id = session["uuid"]
    print(f"Client {id} sending selected text to backend...")
    response_generators[id].put_input(message)
    print(f"Client {id} sent selected text to backend")


@socketio.on("set_transcriber")
def handle_message(message):
    global transcribers, response_generators
    id = session["uuid"]
    print(f"Setting transcriber of client {id} to {message}")
    old_lang = transcribers[id]['client'].lang
    transcribers[id]['client'].destroy()
    transcribers[id]['client'] = TranscriberFactory.create(message, id, socketio, transcribertype='client', lang=old_lang)
    transcribers[id]['desktop'].destroy()
    transcribers[id]['desktop'] = TranscriberFactory.create(message, id, socketio, transcribertype='desktop', lang=old_lang)
    socketio.start_background_task(transcribers[id]['client'].emit_latest_transcription)
    socketio.start_background_task(transcribers[id]['desktop'].emit_latest_transcription)


@socketio.on("set_response_generator")
def handle_message(message):
    global transcribers, response_generators
    id = session["uuid"]
    print(f"Setting response generator client {id} to {message}")
    old_lang = response_generators[id].language
    response_generators[id].destroy()
    response_generators[id] = ResponseFactory.create(
        response_engine_selected=message, uid=id, socketio=socketio, language=old_lang
    )
    socketio.start_background_task(response_generators[id].emit_latest_response)


@socketio.on("send_language_change_to_backend")
def handle_message(message):
    global transcribers, response_generators
    id = session["uuid"]
    print(f"Setting transcriber of client {id} to {message}")
    language_code_mapping = {
        "English (US)": "en-US",
        "English (UK)": "en-GB",
        "French (CA)": "fr-CA",
        "French (FR)": "fr-FR",
        "Spanish (US)": "es-US",
        "Hindi (IN)": "hi-IN",
        "Japanese (JP)": "ja-JP",
        "Korean (SK)": "ko-KR",
    }
    translate_language_mapping = {
        "English (US)": "en",
        "English (UK)": "en",
        "French (CA)": "fr",
        "French (FR)": "fr",
        "Spanish (US)": "es",
        "Hindi (IN)": "hi",
        "Japanese (JP)": "ja",
        "Korean (SK)": "ko",
    }
    translate_lang = translate_language_mapping[message["lang"]]
    lang = language_code_mapping[message["lang"]]
    response_engine_selected = response_generators[id].response_engine_selected
    response_generators[id].destroy()
    transcribers[id]['desktop'].destroy()
    transcribers[id]['client'].destroy()
    del transcribers[id]
    del response_generators[id]
    # TODO: should depend on user setting and not hardcode googlecloud, gptscience
    print("creating responsegen with lang" + str(translate_lang))
    response_generators[id] = ResponseFactory.create(
        response_engine_selected, uid=id, socketio=socketio, language=translate_lang
    )
    transcribers[id] = {'client':TranscriberFactory.create(
        "googlecloud", id, socketio=socketio, lang=lang, transcribertype='client'
    ),'desktop':TranscriberFactory.create(
        "googlecloud", id, socketio=socketio, lang=lang, transcribertype='desktop'
    )}
    socketio.start_background_task(response_generators[id].emit_latest_response)
    socketio.start_background_task(transcribers[id]['client'].emit_latest_transcription)
    socketio.start_background_task(transcribers[id]['desktop'].emit_latest_transcription)


if __name__ == "__main__":
    print("running")
    socketio.run(app)
