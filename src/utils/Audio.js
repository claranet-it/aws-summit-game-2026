let ctx;

function getContext() {
  if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

export function playBeep(frequency = 440, duration = 0.1, type = 'square', timeDelay = 0, volume = 0.1) {
  const context = getContext();
  if (!context) return;

  if (context.state === 'suspended') {
    // Cannot resume synchronously without user action, but it will automatically resume on next click/key
  }

  const osc = context.createOscillator();
  const gainNode = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, context.currentTime + timeDelay);

  gainNode.gain.setValueAtTime(volume, context.currentTime + timeDelay);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + timeDelay + duration);

  osc.connect(gainNode);
  gainNode.connect(context.destination);

  osc.start(context.currentTime + timeDelay);
  osc.stop(context.currentTime + timeDelay + duration);
}

export function playJumpSound() {
  playBeep(600, 0.1, 'square');
}

export function playHitSound() {
  playBeep(150, 0.2, 'sawtooth');
}

export function playYeahSound() {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance("yeah!");
    msg.pitch = 1.2;
    msg.rate = 1.2;
    window.speechSynthesis.speak(msg);
  }
}

export function playHereItComesSound() {
  // Classic 8-bit bonus jingle: ascending arpeggio + fanfare
  playBeep(262, 0.07, 'square', 0.00);   // C4
  playBeep(330, 0.07, 'square', 0.07);   // E4
  playBeep(392, 0.07, 'square', 0.14);   // G4
  playBeep(523, 0.07, 'square', 0.21);   // C5
  playBeep(659, 0.07, 'square', 0.28);   // E5
  playBeep(784, 0.12, 'square', 0.35);   // G5
  playBeep(1047, 0.2,  'square', 0.47);  // C6 (fanfare peak)
}

export function playVroomSound() {
  const context = getContext();
  if (!context || context.state === 'suspended') return;

  const t = context.currentTime;
  const o = context.createOscillator();
  const filter = context.createBiquadFilter();
  const g = context.createGain();

  o.type = 'sawtooth';

  // Lowpass filter for engine muzzle
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.8);

  o.connect(filter);
  filter.connect(g);
  g.connect(context.destination);

  // Doppler pitch drop
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.8);

  // Vol envelope
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.2, t + 0.2); // Loud
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

  o.start(t);
  o.stop(t + 0.8);
}

let bgmInterval;
export function startBGM() {
  if (bgmInterval) return;

  // 8-bit arpeggio melody (C, F, G progressions)
  const melody = [
    261.63, null, 329.63, null, 392.00, 523.25, 392.00, 329.63, // C
    261.63, null, 329.63, null, 392.00, 523.25, 392.00, 329.63,
    349.23, null, 440.00, null, 523.25, 698.46, 523.25, 440.00, // F
    196.00, null, 246.94, null, 293.66, 392.00, 293.66, 246.94  // G
  ];

  let step = 0;

  bgmInterval = setInterval(() => {
    const context = getContext();
    if (context && context.state === 'suspended') {
      context.resume(); // Attempts to resume if user has started interaction
    }

    // Safety check, don't spam if strictly suspended
    if (context && context.state !== 'running') return;

    const freq = melody[step % melody.length];

    // Main melody note
    if (freq) {
      playBeep(freq, 0.15, 'square', 0, 0.015);
    }

    // Simple bass beat on standard intervals
    if (step % 4 === 0) {
      const bassFreq = freq ? freq / 2 : 130.81;
      playBeep(bassFreq, 0.15, 'triangle', 0, 0.03); // Triangle nice for bass
    }

    step++;
  }, 125); // Faster, upbeat tempo (125ms per note)
}

export function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}
