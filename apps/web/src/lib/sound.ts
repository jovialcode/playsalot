/** Tiny procedural sound effects (Web Audio API) — no audio assets needed. */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType = "sine", peakGain = 0.15): void {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = audio.currentTime + startOffset;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

export function playCardSound(): void {
  tone(520, 0, 0.08, "triangle", 0.12);
}

export function playDrawSound(): void {
  tone(300, 0, 0.1, "sine", 0.1);
  tone(420, 0.05, 0.1, "sine", 0.08);
}

export function playFlipSound(): void {
  tone(600, 0, 0.05, "square", 0.06);
}

export function playInvalidSound(): void {
  tone(140, 0, 0.18, "sawtooth", 0.12);
}

export function playTurnStartSound(): void {
  tone(660, 0, 0.08, "sine", 0.08);
  tone(880, 0.08, 0.12, "sine", 0.08);
}

export function playWinSound(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle", 0.14));
}

export function playLoseSound(): void {
  [392, 349, 293].forEach((f, i) => tone(f, i * 0.12, 0.25, "sine", 0.12));
}

export function playRingSound(): void {
  tone(1200, 0, 0.06, "sine", 0.1);
}

export function playRingCorrectSound(): void {
  [784, 988, 1175].forEach((f, i) => tone(f, i * 0.07, 0.18, "sine", 0.13));
}

export function playRingWrongSound(): void {
  tone(160, 0, 0.22, "sawtooth", 0.13);
}

export function playStepSound(): void {
  tone(700, 0, 0.04, "square", 0.05);
}

export function playDiceRollSound(): void {
  for (let i = 0; i < 4; i += 1) tone(300 + i * 40, i * 0.05, 0.05, "square", 0.06);
}

export function playDiceLandSound(): void {
  tone(520, 0, 0.1, "triangle", 0.12);
}

export function playPurchaseSound(): void {
  [660, 880].forEach((f, i) => tone(f, i * 0.06, 0.15, "sine", 0.12));
}

export function playBuildSound(): void {
  tone(220, 0, 0.06, "square", 0.08);
  tone(330, 0.05, 0.08, "square", 0.07);
}

export function playCashGainSound(): void {
  tone(880, 0, 0.1, "sine", 0.1);
}

export function playCashLossSound(): void {
  tone(220, 0, 0.14, "sawtooth", 0.1);
}

export function playStoneSound(): void {
  tone(240, 0, 0.05, "square", 0.14);
  tone(180, 0.02, 0.06, "sine", 0.08);
}
