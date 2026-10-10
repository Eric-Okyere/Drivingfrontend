// Small helper around the two feedback sound effects used across the quiz experience.
// Uses plain HTMLAudioElement (no external storage) so it works the same in every browser.

let clapAudio: HTMLAudioElement | null = null;
let oohAudio: HTMLAudioElement | null = null;

function getAudio(kind: 'clap' | 'ooh'): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (kind === 'clap') {
    if (!clapAudio) clapAudio = new Audio('/sounds/clap.mp3');
    return clapAudio;
  }
  if (!oohAudio) oohAudio = new Audio('/sounds/ooh.mp3');
  return oohAudio;
}

export function playCorrectSound() {
  const audio = getAudio('clap');
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Autoplay can be blocked until the user interacts with the page; safe to ignore.
  });
}

export function playWrongSound() {
  const audio = getAudio('ooh');
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
