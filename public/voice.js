const button = document.querySelector('#listen');
const status = document.querySelector('[role=status]');
const transcript = document.querySelector('#transcript');
const useTranscript = document.querySelector('#use-transcript');
let recognition;
let speechError;

function updateTranscriptButton() {
  useTranscript.disabled = Boolean(recognition) || !transcript.value.trim();
}

transcript.oninput = updateTranscriptButton;

useTranscript.onclick = async () => {
  const text = transcript.value.trim();
  if (recognition || !text) return;

  useTranscript.disabled = true;
  try {
    if (await chrome.runtime.sendMessage({ voiceTranscript: text }) !== true) {
      throw new Error('Open the WaitGoogle side panel to receive the transcript.');
    }
    window.close();
  } catch (error) {
    status.textContent = error.message;
    updateTranscriptButton();
  }
};

button.onclick = async () => {
  if (recognition) {
    button.disabled = true;
    status.textContent = 'Finishing the transcript…';
    recognition.stop();
    return;
  }

  button.disabled = true;
  useTranscript.disabled = true;
  speechError = undefined;
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

    const previousTranscript = transcript.value.trim();
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.processLocally = true;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      const phrases = Array.from(event.results, result => result[0].transcript.trim());
      transcript.value = [previousTranscript, ...phrases].filter(Boolean).join(' ').slice(0, 1500);
    };
    recognition.onerror = event => {
      speechError = 'Local speech recognition: ' + event.error + '.';
      status.textContent = speechError;
    };
    recognition.onend = () => {
      recognition = undefined;
      button.textContent = 'Continue speaking';
      button.disabled = false;
      transcript.readOnly = false;
      updateTranscriptButton();
      status.textContent = speechError || (transcript.value.trim()
        ? 'Review the transcript. Continue speaking to add more, or choose Use transcript.'
        : 'No speech was transcribed. Try again.');
    };
    recognition.start();
    transcript.readOnly = true;
    button.textContent = 'Stop microphone';
    button.disabled = false;
    status.textContent = 'Listening on this device…';
  } catch (error) {
    recognition = undefined;
    status.textContent = error.message;
    button.disabled = false;
    updateTranscriptButton();
  }
};
