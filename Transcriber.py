import queue
from google.cloud import speech_v1 as speech
import os
import abc
import time
import soundcard as sc
import numpy as np

class Transcriber:
    def get_audio(self):
        while True:
            yield self.audio_q.get()

    def put_audio(self, data):
        self.audio_q.put(data)

    def __init__(self, uid: str, socketio):
        self.stop = False
        self.audio_q = queue.Queue()
        self.uid = uid
        self.socketio = socketio

    @abc.abstractmethod
    def emit_latest_transcription(self):
        pass

    @abc.abstractmethod
    def destroy(self):
        self.stop = True


class GoogleCloud(Transcriber):
    def __init__(self, key_filename: str, uid: str, socketio, lang: str, transcribertype: str):
        super().__init__(uid=uid, socketio=socketio)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_filename
        self.client = speech.SpeechClient()
        self.config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=lang,
            enable_word_time_offsets=False,
            enable_automatic_punctuation=True,
        )
        self.streaming_config = speech.types.StreamingRecognitionConfig(
            config=self.config, interim_results=True
        )
        self.transcription_q = queue.Queue()
        self.stop = False
        self.lang = lang
        self.transcribertype = transcribertype

    def desktop_audio_gen(self):
        SAMPLE_RATE = 16000
        while True:
            with sc.get_microphone(id=str(sc.default_speaker().name), include_loopback=True).recorder(samplerate=SAMPLE_RATE) as mic:
                data = mic.record(numframes=SAMPLE_RATE*0.256)
                normalized_data = np.int16(data / np.max(np.abs(data)) * 32767)
                linear16_data = normalized_data.astype(np.int16)
                yield linear16_data[:,0].tobytes()

    def emit_latest_transcription(self):
        socket_name = f"send_{self.transcribertype}_transcription_to_frontend"
        try:
            if self.transcribertype == 'desktop':
                gen = self.desktop_audio_gen()
                requests = (
                    speech.StreamingRecognizeRequest(audio_content=content)
                    for content in gen
                )
                api_responses = self.client.streaming_recognize(
                    self.streaming_config, requests
                )
                for response in api_responses:
                    if self.stop:
                        return
                    if not response.results:
                        continue
                    result = response.results[0]
                    if result.alternatives:
                        self.socketio.emit(
                            socket_name,
                            {
                                "is_final": result.is_final,
                                "utterance": result.alternatives[0].transcript,
                            },
                            room=self.uid,
                        )
            else:
                #print('generating client audio')
                audio_generator = self.get_audio()
                requests = (
                    speech.StreamingRecognizeRequest(audio_content=content)
                    for content in audio_generator
                )
                api_responses = self.client.streaming_recognize(
                    self.streaming_config, requests
                )
                for response in api_responses:
                    if self.stop:
                        return
                    if not response.results:
                        continue
                    result = response.results[0]
                    if result.alternatives:
                        self.socketio.emit(
                            socket_name,
                            {
                                "is_final": result.is_final,
                                "utterance": result.alternatives[0].transcript,
                            },
                            room=self.uid,
                        )
        except Exception as e:
            print(e)  # doesn't crash anything so whatever lol

    def destroy(self):
        super().destroy()


class Shakespeare(Transcriber):
    def __init__(self, uid: str, socketio, lang="en-US"):
        super().__init__(uid=uid, socketio=socketio)
        self.lang = lang

    def emit_latest_transcription(self):
        text_client = """Reverse a Linked List, Explain a Fourier Transform, 
What is a solution to the wave equation for a helium atom, 
How many carbon atoms are in a molecule of glucose, 
From fairest creatures we desire increase,
That thereby beauty's rose might never die,
But as the riper should by time decease,
His tender heir might bear his memory:
But thou contracted to thine own bright eyes,
Feed'st thy light's flame with self-substantial fuel,
Making a famine where abundance lies,
Thy self thy foe, to thy sweet self too cruel:
Thou that art now the world's fresh ornament,
And only herald to the gaudy spring,
Within thine own bud buriest thy content,
And tender churl mak'st waste in niggarding:
Pity the world, or else this glutton be,
To eat the world's due, by the grave and thee.

When forty winters shall besiege thy brow,
And dig deep trenches in thy beauty's field,
Thy youth's proud livery so gazed on now,
Will be a tattered weed of small worth held:  
Then being asked, where all thy beauty lies,
Where all the treasure of thy lusty days;
To say within thine own deep sunken eyes,
Were an all-eating shame, and thriftless praise.
How much more praise deserved thy beauty's use,
If thou couldst answer 'This fair child of mine
Shall sum my count, and make my old excuse'
Proving his beauty by succession thine.
This were to be new made when thou art old,
And see thy blood warm when thou feel'st it cold."""
        text_desktop = """hi I'm Edgar and I'm a software engineer
at Google, hi I'm Becky and I'm a
software engineer at Google,
so Edgar the question I'm going to give,
you today is a I'm going to give you a,
collection of numbers and I need you to,
take this collection of numbers and find,
a matching pair that is equal to a sum,
that I give you as well okay so for,
example the collection of numbers could,
be 1 2
3
& 9 and
the sum that I'm looking for,
is
8 okay and then another example just for,
another set of numbers could be a,
1 a 2 a 4 and a 4 and then,
again is some that I'm looking for is 8,
so in this case there I guess what I'm,
trying to figure out is,
you're looking for a pair of numbers,
then that add up to 8 yeah right so in,
this case there isn't a pair of numbers,
that add up to it that is true ok,
example and in this case it is because,
the foreign for add up to 8 correct okay,
so this is this would be like,
no this is yes,
ok yes you ultimately happen,
okay so how are these numbers given can,
I assume that they're kind like in,
memory
an array or something yeah they're in,
memory you can go with an array you can,
also assume that they're ordered,
intending water ok Oh interesting okay,
so how about repeating elements can I,
assume that they would be like for,
instance here what if I I guess but what,
if I didn't have that for what I use,
like the 4 and the 4 to get that 8 you,
can't repeat the same element at the,
same index twice but certainly the same,
number may appear twice ok ok so like,
that would be would be I yes how about,
these numbers are they integers or are,
they floating point or you can assume,
they'll always be users ok negatives,
positives negatives can happen ok cool,
so
well the first the simplest solution of,
course is just comparing every single,
possible pair so I could just have two,
for loops one scanning the whole thing,
and then the second one starting from,
let's say you have the I loop and then,
the J loop starting from I plus one so,
that I don't repeat the same value and,
just testing all of them if the sum is,
equal to the to the target sum I mean,
that's obviously not very,
"""
        for sentence_index, sentence in enumerate(text_client.split(",")):
            desktop_sentence = text_desktop.split(",")[sentence_index]
            desktop_utterance = ""
            desktop_words = desktop_sentence.split(" ")
            for i, word in enumerate(desktop_words):
                if self.stop:
                    return
                if i != len(desktop_words) - 1:
                    desktop_utterance += word + " "
                    self.socketio.emit(
                        "send_desktop_transcription_to_frontend",
                        {"is_final": False, "utterance": desktop_utterance},
                        room=self.uid,
                    )
                time.sleep(0.1)
            desktop_utterance += word + ", "
            self.socketio.emit(
                "send_desktop_transcription_to_frontend",
                {"is_final": True, "utterance": desktop_utterance},
                room=self.uid,
            )
            time.sleep(1)
            if sentence_index % 3 == 0:
                client_sentence = text_client.split(",")[sentence_index]
                client_utterance = ""
                client_words = client_sentence.split(" ")
                for i, word in enumerate(client_words):
                    if self.stop:
                        return
                    if i != len(client_words) - 1:
                        client_utterance += word + " "
                        self.socketio.emit(
                            "send_client_transcription_to_frontend",
                            {"is_final": False, "utterance": client_utterance},
                            room=self.uid,
                        )
                    time.sleep(0.1)
                client_utterance += word + ", "
                self.socketio.emit(
                    "send_client_transcription_to_frontend",
                    {"is_final": True, "utterance": client_utterance},
                    room=self.uid,
                )
                time.sleep(1)

    def destroy(self):
        super().destroy()


class Null(Transcriber):
    def __init__(self, uid, socketio, lang="en-US"):
        super().__init__(uid=uid, socketio=socketio)
        self.lang = lang

    def destroy(self):
        super().destroy()
