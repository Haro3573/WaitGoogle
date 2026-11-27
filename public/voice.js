const button = document.querySelector('#listen');
const status = document.querySelector('[role=status]');
let recognition;
let voiceError = false;

button.onclick = async () => {
  if (recognition) {
    recognition.stop();
    return;
  }
  button.disabled = true;
  voiceError = false;
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const options = { langs: ['en-US'], processLocally: true };
    const availability = await SpeechRecognition?.available?.(options);
    if (!['available', 'downloadable'].includes(availability)) {
      throw new Error('Local English speech recognition is unavailable.');
    }
    if (availability === 'downloadable') {
      status.textContent = 'Downloading local English speech recognition…';
      if (!await SpeechRecognition.install(options)) throw new Error('Could not download the English speech pack.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.processLocally = true;
    recognition.onresult = async event => {
      const text = event.results[0][0].transcript.trim().slice(0, 1500);
      if (!text) return;
      voiceError = true;
      status.textContent = 'Sending transcript to the WaitGoogle side panel…';
      try {
        if (await chrome.runtime.sendMessage({ voiceTranscript: text }) !== true) {
          throw new Error('Open the WaitGoogle side panel to receive the transcript.');
        }
        window.close();
      } catch (error) {
        status.textContent = error.message;
      }
    };
    recognition.onerror = event => {
      voiceError = true;
      status.textContent = 'Local speech recognition: ' + event.error + '.';
    };
    recognition.onend = () => {
      recognition = undefined;
      button.textContent = 'Start local transcription';
      button.disabled = false;
      if (!voiceError) status.textContent = 'No speech was transcribed. Try again.';
    };
    recognition.start();
    button.textContent = 'Stop microphone';
    button.disabled = false;
    status.textContent = 'Listening on this device…';
  } catch (error) {
    recognition = undefined;
    status.textContent = error.message;
    button.disabled = false;
  }
};
