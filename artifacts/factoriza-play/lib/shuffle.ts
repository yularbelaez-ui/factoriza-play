/**
 * Returns a new array in a random order without mutating the exercise bank.
 * Each screen creates its order once per activity session, so students can
 * receive different sequences while exercise IDs and analytics stay stable.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}