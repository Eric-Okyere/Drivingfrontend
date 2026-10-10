// Emoji "confetti" bursts for quiz feedback — a big celebratory burst for a correct
// answer, and a shower of crying emojis for a wrong one. Built on top of canvas-confetti's
// shapeFromText, so the particles are real emoji rather than coloured squares.
import confetti from 'canvas-confetti';

let celebrateShapes: confetti.Shape[] | null = null;
let sadShapes: confetti.Shape[] | null = null;

const CELEBRATE_EMOJIS = ['🎉', '👏', '🥳', '✨', '😄', '🙌'];
const SAD_EMOJIS = ['😢', '😭', '💧', '😞'];

function getShapes(emojis: string[], cache: confetti.Shape[] | null): confetti.Shape[] {
  if (cache) return cache;
  return emojis.map((e) => confetti.shapeFromText({ text: e, scalar: 3 }));
}

/** A big, lively burst of celebration emojis from the center of the screen. */
export function celebrateCorrectAnswer() {
  if (typeof window === 'undefined') return;
  celebrateShapes = getShapes(CELEBRATE_EMOJIS, celebrateShapes);

  confetti({
    particleCount: 36,
    spread: 100,
    startVelocity: 45,
    gravity: 0.9,
    scalar: 1,
    shapes: celebrateShapes,
    origin: { y: 0.6 },
  });
  // Two extra side bursts so it reads as "a lot" of emojis rather than one puff.
  confetti({
    particleCount: 16,
    angle: 60,
    spread: 70,
    startVelocity: 40,
    shapes: celebrateShapes,
    origin: { x: 0.1, y: 0.7 },
  });
  confetti({
    particleCount: 16,
    angle: 120,
    spread: 70,
    startVelocity: 40,
    shapes: celebrateShapes,
    origin: { x: 0.9, y: 0.7 },
  });
}

/** A gentle shower of crying emojis falling from the top of the screen. */
export function showWrongAnswerEmojis() {
  if (typeof window === 'undefined') return;
  sadShapes = getShapes(SAD_EMOJIS, sadShapes);

  confetti({
    particleCount: 28,
    angle: 270,
    spread: 100,
    startVelocity: 18,
    gravity: 0.5,
    decay: 0.95,
    ticks: 180,
    scalar: 1,
    shapes: sadShapes,
    origin: { y: 0.05 },
  });
}
