import React, { useEffect, useReducer, useRef } from "react";
import dictionary from "../data/five-letter-words.json";
import "../data/styles.css";

const wordle = "ABUSE";
const maxAttempts = 6;
const initialState = Object.freeze({
  wordle: wordle,
  words: Object.freeze([""]),
  guess: 0,
  done: false,
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
  return { ...state, words: words, error: word.length === 5 };
}
function removeLetter(state) {
  const { guess, words } = state;
  const word = words[guess];
  words[guess] = word.slice(0, -1);
  return { ...state, error: word.length === 0 };
}

function submitWord(state, element) {
  const { wordle, words, guess } = state;
  const isValidWord = dictionary.includes(words[guess]);
  return {
    ...state,
    words: isValidWord ? [...words, ""] : words,
    guess: isValidWord ? guess + 1 : guess,
    error: !isValidWord,
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

  return (
    <main>
      {JSON.stringify(state)}
      {state.done && (
        <button onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
          Play Again
        </button>
      )}

      <h1 className="title">WORDLE</h1>
      <Board state={state} />
    </main>
  );
}

const Board = (props) => {
  const state = props.state;
  const words = [...state.words]
    .map((word, index) => {
      const hints = state.guess > index ? giveHints(state.wordle, word) : [];
      const letters = [...word.padEnd(5)];
      return {
        letters: letters.map((letter, i) => ({
          letter: letter,
          style: styles[hints[i]],
        })),
      };
    })
    .concat([
      ...Array(maxAttempts).fill({
        letters: Array(5).fill({
          letter: "",
        }),
      }),
    ])
    .slice(0, maxAttempts);

  return (
    <div className="board">
      {[...words].map(({ letters, classes }, index) => (
        <Word key={index} classes={classes}>
          {letters.map(({ letter, style }, letterIndex) => (
            <Letter key={letterIndex} letter={letter} style={style} />
          ))}
        </Word>
      ))}
    </div>
  );
};

const Word = (props) => {
  return (
    <div className={"row"} ref={props.reference}>
      {props.children}
    </div>
  );
};

const Letter = (props) => (
  <div className="item" style={props.style}>
    {props.letter}
  </div>
);
