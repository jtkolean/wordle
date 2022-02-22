import React, { useEffect, useReducer, useRef } from "react";
import dictionary from "../data/five-letter-words.json";
import "../data/styles.css";

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
  },
  wrong: {
    color: "orange",
  },
  none: {
    color: "lightgray",
  },
};

function giveHints(expectedWord, word) {
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
}

function addLetter(state, letter) {
  const words = [...state.words];
  const word = words[state.guess];
  const newWord = word.length === 0 ? "" : word;
  const newLetter = word.length < 5 ? letter : "";
  words[state.guess] = newWord.concat(newLetter);
  const error =
    word.length === 5
      ? [...state.error, "No more avaliable slots to add a letter"]
      : state.error;
  return { ...state, words: words, error: error };
}

function removeLetter(state) {
  const words = [...state.words];
  words[state.guess] = words[state.guess].slice(0, -1);
  const error =
    words[state.guess].length === 0
      ? [...state.error, "No more letters to remove"]
      : state.error;
  return { ...state, words: words, error: error };
}

function submitWord(state, element) {
  const { wordle, words, guess } = state;
  const isValidWord = dictionary.includes(words[guess]);
  return {
    ...state,
    guess: isValidWord ? guess + 1 : guess,
    error: !isValidWord ? [...state.error, "Not a valid word"] : [],
    done: words[guess] === wordle || guess === maxAttempts - 1,
  };
}

function inputReducer(state, action) {
  console.log("useReducer", action.type, action, state, initialState);
  switch (action.type) {
    case "ADD_LETTER":
      return addLetter(state, action.key);
    case "REMOVE_LETTER":
      return removeLetter(state);
    case "SUBMIT_WORD":
      return submitWord(state, action.element);
    case "PLAY_AGAIN":
      return initialState;
    case "REMOVE_ERROR":
      return {
        ...state,
        error: state.error.slice(0, -1),
      };
    default:
      return state;
  }
}

export default function Wordle() {
  const [state, dispatch] = useReducer(inputReducer, initialState);

  useEffect(() => {
    if (state.done) {
      return;
    }

    const handleKeyPress = (event) => {
      const keyLabel = event.key.toUpperCase();
      if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(keyLabel)) {
        dispatch({ type: "ADD_LETTER", key: keyLabel });
      } else if ("DELETE" === keyLabel) {
        dispatch({ type: "REMOVE_LETTER" });
      } else if ("BACKSPACE" === keyLabel) {
        dispatch({ type: "REMOVE_LETTER" });
      } else if ("ENTER" === keyLabel) {
        dispatch({
          type: "SUBMIT_WORD",
        });
      }
    };

    window.addEventListener("keyup", handleKeyPress);
    return () => window.removeEventListener("keyup", handleKeyPress);
  }, [state.done]);

  useEffect(() => {
    if (state.error.length > 0) {
      setTimeout(() => {
        dispatch({ type: "REMOVE_ERROR" });
      }, 1000);
    }
  }, [state.error]);

  return (
    <div>
      <main>
        <h1 className="title">WORDLE</h1>
        <Board state={state} />
      </main>
      <Keyboard state={state} />
      {JSON.stringify(state)}
      {state.done && (
        <button onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
          Play Again
        </button>
      )}
    </div>
  );
}

const Board = (props) => {
  const state = props.state;
  return (
    <div className="board">
      {[...state.words].map((word, index) => {
        const hints = index < state.guess ? giveHints(state.wordle, word) : [];
        const shake = state.guess === index && state.error.length;
        return (
          <Word key={index} shake={shake}>
            {[...word.padEnd(5)].map((letter, letterIndex) => (
              <Letter key={letterIndex} color={hints[letterIndex]}>
                {letter}
              </Letter>
            ))}
          </Word>
        );
      })}
    </div>
  );
};

const Word = (props) => (
  <div
    className="word shake"
    style={{ animationPlayState: props.shake ? "running" : "paused" }}
  >
    {props.children}
  </div>
);

const Letter = (props) => (
  <div className="letter-item" style={styles[props.color]}>
    {props.children}
  </div>
);

const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["DELETE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
];

const getKeyboardElement = (key, rowIndex, columnIndex, hint) => {
  switch (key) {
    case "DELETE":
      return (
        <button
          type="button"
          className="keyboard-double-key"
          style={styles[hint]}
        >
          DEL
        </button>
      );
    case "ENTER":
      return (
        <button
          type="button"
          className="keyboard-double-key"
          style={styles[hint]}
        >
          ENTER
        </button>
      );
    default:
      return (
        <button type="button" className="keyboard-key" style={styles[hint]}>
          {key}
        </button>
      );
  }
};

const Keyboard = (props) => {
  const map = {};
  const hints = [...props.state.words]
    .filter((_, index) => props.state.guess > index)
    .map((word) => {
      const h = giveHints(props.state.wordle, word);
      [...word].map((letter, index) => {
        if (map.hasOwnProperty(letter) && map[letter] !== "correct") {
          map[letter] = h[index];
        } else {
          map[letter] = h[index];
        }
      });
    });

  return (
    <div className="keyboard">
      {KEYS.map((row, rowIndex) => (
        <div className="keyboard-row">
          {[...row].map((key, index) =>
            getKeyboardElement(key, rowIndex, index, map[key])
          )}
        </div>
      ))}
    </div>
  );
};
