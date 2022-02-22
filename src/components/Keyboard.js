import React from "react";
import "../data/styles.css";
import { styles, giveHints } from "../data/wordle-common";

const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["DELETE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
];

const createElement = (
  key,
  rowIndex,
  columnIndex,
  hint,
  dispatch,
  gameOver
) => {
  switch (key) {
    case "DELETE":
      return (
        <div
          key={rowIndex + columnIndex}
          className="keyboard-double-key"
          style={styles[hint]}
          onClick={() =>
            !gameOver && dispatch({ type: "REMOVE_LETTER", key: "DELETE" })
          }
        >
          DEL
        </div>
      );
    case "ENTER":
      return (
        <div
          key={rowIndex + columnIndex}
          className="keyboard-double-key"
          style={styles[hint]}
          onClick={() => !gameOver && dispatch({ type: "SUBMIT_WORD" })}
        >
          ENTER
        </div>
      );
    default:
      return (
        <div
          key={rowIndex + columnIndex}
          className="keyboard-key"
          style={styles[hint]}
          onClick={() =>
            !gameOver && dispatch({ type: "ADD_LETTER", key: key })
          }
        >
          {key}
        </div>
      );
  }
};

const getLetterHints = ({ wordle, words, guess }) => {
  const map = {};
  [...words]
    .filter((_, index) => guess > index)
    .forEach((word) => {
      const hints = giveHints(wordle, word);
      [...word].forEach((letter, index) => {
        if (map.hasOwnProperty(letter)) {
          if (map[letter] === "none") {
            map[letter] = hints[index];
          } else if (map[letter] === "wrong" && hints[index] === "correct") {
            map[letter] = hints[index];
          }
        } else {
          map[letter] = hints[index];
        }
      });
    });
  return map;
};

const Keyboard = (props) => {
  const { dispatch, done } = props.state;
  const map = getLetterHints(props.state);

  return (
    <div className="keyboard">
      {KEYS.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
          {[...row].map((key, index) =>
            createElement(key, rowIndex, index, map[key], dispatch, done)
          )}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
