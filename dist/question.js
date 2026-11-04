const maxQuestionLength = 500;

function comparisonPayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      !Array.isArray(value.choices) || value.choices.length < 1 || value.choices.length > 6 ||
      value.choices.some(choice => !choice || typeof choice !== 'object' || Array.isArray(choice)) ||
      (value.horizon !== undefined && (!value.horizon || typeof value.horizon !== 'object' || Array.isArray(value.horizon)))) {
    throw new Error('The comparison response was invalid. Your choices were kept.');
  }
  // The app validates catalogue IDs, quantities and the horizon before applying.
  return { choices: value.choices, ...(value.horizon === undefined ? {} : { horizon: value.horizon }) };
}

export function setupQuestionForm(onApply, options = {}) {
  const page = options.document || globalThis.document;
  const request = options.fetch || globalThis.fetch;
  const Recognition = options.SpeechRecognition || globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  const timeoutMs = options.timeoutMs ?? 25000;
  const form = page.querySelector('#question-form');
  if (!form) return { invalidate() {} };
  const input = form.querySelector('#question-input');
  const submit = form.querySelector('[type="submit"]');
  const cancel = form.querySelector('#question-cancel');
  const status = form.querySelector('#question-status');
  const voice = form.querySelector('#question-voice');
  const voiceNote = form.querySelector('#question-voice-note');
  const voiceStatus = form.querySelector('#question-voice-status');
  let version = 0;
  let active;
  let recognition;
  const cache = new Map();

  function busy(value) {
    form.setAttribute('aria-busy', String(value));
    submit.disabled = value;
    cancel.hidden = !value;
    submit.textContent = value ? 'Preparing comparison…' : 'Compare';
  }

  function say(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  function invalidate() {
    version += 1;
    if (active) {
      active.controller.abort();
      clearTimeout(active.timeout);
      active = undefined;
      busy(false);
    }
  }

  input.addEventListener('input', () => {
    const pending = Boolean(active);
    invalidate();
    input.setAttribute('aria-invalid', 'false');
    say(pending ? 'Question changed. Submit again when ready.' : '');
  });
  cancel.addEventListener('click', () => {
    invalidate();
    say('Cancelled. Your choices were kept.');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    invalidate();
    const question = input.value.trim();
    if (!question || question.length > maxQuestionLength) {
      input.setAttribute('aria-invalid', 'true');
      say(!question ? 'Enter a comparison question.' : 'Use 500 characters or fewer.', true);
      input.focus();
      return;
    }
    if (recognition) {
      const session = recognition;
      recognition = undefined;
      session.abort();
      voice.textContent = 'Dictate';
      voice.setAttribute('aria-pressed', 'false');
      voiceStatus.textContent = 'Dictation stopped.';
    }
    input.setAttribute('aria-invalid', 'false');
    const current = version;
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    active = { controller, timeout };
    busy(true);
    say('Preparing comparison. Current choices stay in place until it is ready.');
    try {
      let payload = cache.get(question);
      if (!payload) {
        const response = await request('/api/compare', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }), signal: controller.signal
        });
        if (current !== version) return;
        if (!response.ok) {
          const messages = {
            400: 'Check the question and try again.',
            422: 'No matching comparison was found. Try naming the activities more specifically.',
            429: 'The shared question limit has been reached. Try again later.',
            503: 'Question comparison is temporarily unavailable. Try again later.'
          };
          const details = await response.json?.().catch(() => null);
          const message = typeof details?.error === 'string' && details.error.length <= 200 ? details.error : messages[response.status];
          throw new Error(message || 'Question comparison failed. Try again.');
        }
        payload = comparisonPayload(await response.json());
      }
      if (current !== version) return;
      if (timedOut) throw new Error('The request timed out. Try again.');
      // Keep an immutable-by-ownership cache snapshot; the app may edit its copy.
      const saved = structuredClone(payload);
      await onApply(structuredClone(saved));
      if (current !== version) return;
      cache.delete(question);
      cache.set(question, saved);
      if (cache.size > 8) cache.delete(cache.keys().next().value);
      if (current === version) say('Comparison updated. Check the quantities and schedules below.');
    } catch (error) {
      if (current !== version) return;
      const message = timedOut ? 'The request timed out. Try again.' :
        error instanceof Error && error.name !== 'AbortError' ? error.message : 'Question comparison failed. Try again.';
      say(message + (message.includes('Your choices were kept.') ? '' : ' Your choices were kept.'), true);
    } finally {
      clearTimeout(timeout);
      if (current === version) {
        active = undefined;
        busy(false);
      }
    }
  });

  const canDictate = typeof Recognition === 'function';
  voice.hidden = !canDictate;
  voiceNote.hidden = !canDictate;
  if (canDictate) {
    voice.addEventListener('click', () => {
      if (recognition) {
        recognition.stop();
        return;
      }
      let session;
      try {
        session = new Recognition();
      } catch {
        voiceStatus.textContent = 'Dictation could not start. You can type the question.';
        return;
      }
      recognition = session;
      session.lang = page.documentElement.lang || 'en-AU';
      session.continuous = false;
      session.interimResults = false;
      const appended = new Set();
      session.onresult = event => {
        if (recognition !== session) return;
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (!result.isFinal || appended.has(index)) continue;
          appended.add(index);
          const transcript = result[0]?.transcript?.trim();
          if (!transcript) continue;
          invalidate();
          input.value = [input.value.trim(), transcript].filter(Boolean).join(' ');
          input.setAttribute('aria-invalid', 'false');
          say('');
        }
      };
      session.onstart = () => {
        if (recognition !== session) return;
        voice.textContent = 'Stop dictation';
        voice.setAttribute('aria-pressed', 'true');
        voiceStatus.textContent = 'Listening…';
      };
      session.onerror = event => {
        if (recognition !== session) return;
        voiceStatus.textContent = ['not-allowed', 'service-not-allowed'].includes(event.error)
          ? 'Microphone or speech service permission was denied. You can type the question.'
          : event.error === 'no-speech' ? 'No speech detected. You can try again or type.'
          : event.error === 'aborted' ? 'Dictation stopped.' : 'Dictation is unavailable. You can type the question.';
      };
      session.onend = () => {
        if (recognition !== session) return;
        recognition = undefined;
        voice.textContent = 'Dictate';
        voice.setAttribute('aria-pressed', 'false');
        if (voiceStatus.textContent === 'Listening…') voiceStatus.textContent = 'Dictation stopped. Edit the text, then select Compare.';
      };
      try {
        invalidate();
        session.start();
      } catch {
        recognition = undefined;
        voiceStatus.textContent = 'Dictation could not start. You can type the question.';
      }
    });
  }
  return { invalidate() {
    const pending = Boolean(active);
    invalidate();
    if (pending) say('Comparison changed. Submit the question again to replace it.');
  } };
}
