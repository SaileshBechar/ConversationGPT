#FROM gcr.io/google-appengine/python
FROM python:3.10
RUN pip3 install --upgrade pip
RUN pip3 install virtualenv
# Create a virtualenv for dependencies. This isolates these packages from
# system-level packages.
# Use -p python3 or -p python3.7 to select python version. Default is version 2.
RUN virtualenv /env -p python3
# Setting these environment variables are the same as running
# source /env/bin/activate.
ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
WORKDIR /app
COPY . .
RUN pip3 install --no-cache-dir -r requirements.txt
#CMD gunicorn -b :$PORT app:app
CMD gunicorn -b :$PORT -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 app:app