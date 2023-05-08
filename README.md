# Push-To-Talk Speech Recognition

## Description:

This is a demonstration of the Kaldi Speech Recognition Toolkit (<https://kaldi-asr.org/>) using the Zamia generic English model (<https://github.com/gooofy/zamia-speech>).


## Image installation procedure

    docker build -t ptt .

or

    podman build -t ptt .


## Container run procedure

    docker run -p 80:80 ptt

or

    podman run -p 80:80 ptt


## Test procedure

1. Browse to: <http://localhost/>

2. When prompted, allow web page access to the microphone.

3. Click and hold the Push-to-Talk button, and say something into the microphone.


## Limitations

Mozilla Firefox does not implement the getUserMedia sampleRate constraint (<https://bugzilla.mozilla.org/show_bug.cgi?id=1388586>).
