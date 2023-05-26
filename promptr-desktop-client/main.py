import socketio
sio = socketio.Client()
sio.connect('http://localhost:5000')
data = {
    'text': 'test text',
    'type': 'prompt'
}
sio.emit("send_selection_data_to_backend", data)