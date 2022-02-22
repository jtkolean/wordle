const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DELETE_KEYS = Object.freeze(["DELETE", "BACKSPACE"]);
const SUBMIT_KEY = "ENTER";

const wordle = "ABUSE";
const maxAttempts = 6;
const initialState = Object.freeze({
  wordle: wordle,
  words: Object.freeze(Array(6).fill("")),
  guess: 0,
  done: false,
  error: Object.freeze([]),
});

const styles = {
  correct: {
    color: "green",
    backgroundColor: "rgb(194, 255, 194)",
  },
  wrong: {
    color: "orange",
    backgroundColor: "rgb(255, 245, 227)",
  },
  none: {
    color: "lightgray",
    backgroundColor: "#ececec",
  },
};

const giveHints = (expectedWord, word) => {
  var hints = Array(5).fill("none");

  // LETTER IS IN CORRECT POSITION
  const expectedLeftovers = [...expectedWord].map((expectedLetter, index) => {
    if (expectedLetter === word[index]) {
      hints[index] = "correct";
      return "";
    }
    return expectedLetter;
  });

  // LETTER IS IN WRONG POSITION
  [...word].forEach((letter, index) => {
    if (hints[index] === "correct") {
      return;
    }
    if (expectedLeftovers.includes(letter)) {
      hints[index] = "wrong";
    }
  });

  return [...hints];
};

export { giveHints, styles, ALPHABET, DELETE_KEYS, SUBMIT_KEY };
