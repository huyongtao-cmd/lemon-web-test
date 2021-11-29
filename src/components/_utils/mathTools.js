/**
 * Get a random integer between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {int} a random integer
 */
// eslint-disable-next-line import/prefer-default-export
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
