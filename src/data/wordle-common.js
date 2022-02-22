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

export { giveHints, styles };
