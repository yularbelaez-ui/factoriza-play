/**
 * Keeps the correct answer from repeatedly appearing in the first position.
 * The supplied ordinal normally comes from the order in which questions are
 * shown, so a practice session cycles through A, B, C and D predictably.
 */
export function getBalancedAnswerOptions(
  options: string[],
  correctAnswer: string,
  ordinal: number
): string[] {
  const correctIndex = options.indexOf(correctAnswer);
  if (correctIndex < 0 || options.length < 2) return [...options];

  const targetIndex = ((ordinal % options.length) + options.length) % options.length;
  const distractors = options.filter((_, index) => index !== correctIndex);
  const rotation = targetIndex % distractors.length;
  const orderedDistractors = [
    ...distractors.slice(rotation),
    ...distractors.slice(0, rotation),
  ];

  const arranged: string[] = [];
  let distractorIndex = 0;
  for (let index = 0; index < options.length; index += 1) {
    if (index === targetIndex) {
      arranged.push(correctAnswer);
    } else {
      arranged.push(orderedDistractors[distractorIndex]);
      distractorIndex += 1;
    }
  }

  return arranged;
}