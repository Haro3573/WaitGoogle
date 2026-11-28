const button = document.querySelector('#listen');
const status = document.querySelector('[role=status]');
const transcript = document.querySelector('#transcript');
const useTranscript = document.querySelector('#use-transcript');
let recognition;
let speechError;
const liveQA = document.querySelector('#live-qa');
const liveAnswers = document.querySelector('#live-answers');
const liveStatus = document.querySelector('#live-status');
const windowLimit = 1500;
let rollingTranscript = '';
let transcriptOffset = 0;
let answeredThrough = 0;
let transcriptRevision = 0;
let scannedRevision = 0;
let liveSession = 0;
let scanning = false;

function appendFinalSpeech(text) {
  if (!text) return;
  rollingTranscript += (rollingTranscript ? ' ' : '') + text;
  if (rollingTranscript.length > windowLimit) {
    const excess = rollingTranscript.length - windowLimit;
    const boundary = rollingTranscript.indexOf(' ', excess);
    const drop = boundary === -1 ? excess : boundary + 1;
    rollingTranscript = rollingTranscript.slice(drop);
    transcriptOffset += drop;
  }
  transcriptRevision += 1;
}

async function scanTranscript() {
  if (!liveQA.checked || scanning || scannedRevision === transcriptRevision) return;
  scanning = true;
  scannedRevision = transcriptRevision;
  const session = liveSession;
  liveStatus.textContent = 'Looking for shopping questions on this device…';
  try {
    const result = await chrome.runtime.sendMessage({ liveTranscript: {
      text: rollingTranscript,
      offset: transcriptOffset,
      answeredThrough
    } });
    if (session !== liveSession) return;
    if (result?.error) throw new Error(result.error);
    if (!result) throw new Error('Open the WaitGoogle side panel to use live answers.');
    for (const entry of result.answers) {
      const message = document.createElement('p');
      const question = document.createElement('strong');
      question.textContent = entry.question;
      message.append(question, document.createTextNode('\n' + entry.answer));
      liveAnswers.append(message);
      answeredThrough = entry.end;
    }
    liveStatus.textContent = '';
  } catch (error) {
    if (session === liveSession) liveStatus.textContent = error.message;
  } finally {
    scanning = false;
    scanTranscript();
  }
}

liveQA.onchange = () => {
  document.querySelector('#live-section').hidden = !liveQA.checked;
  if (liveQA.checked) return;
  liveSession += 1;
  rollingTranscript = '';
  transcriptOffset = 0;
  answeredThrough = 0;
  transcriptRevision = 0;
  scannedRevision = 0;
  liveStatus.textContent = '';
};

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
    let finalThrough = 0;
    recognition.onresult = event => {
      const phrases = Array.from(event.results, result => result[0].transcript.trim());
      transcript.value = [previousTranscript, ...phrases].filter(Boolean).join(' ').slice(0, 1500);
      while (finalThrough < event.results.length && event.results[finalThrough].isFinal) {
        if (liveQA.checked) {
          appendFinalSpeech(phrases[finalThrough]);
        }
        finalThrough += 1;
      }
      scanTranscript();
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
