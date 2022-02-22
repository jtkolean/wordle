import React, { useEffect, useReducer } from "react";
import dictionary from "../data/five-letter-words.json";
import "../data/styles.css";
import Keyboard from "../components/Keyboard";
import {
  styles,
  giveHints,
  ALPHABET,
  DELETE_KEYS,
  SUBMIT_KEY,
} from "../data/wordle-common";

const wordle = "ABUSE";

const initialState = {
  wordle: wordle,
  words: Array(6).fill(""),
  guess: 0,
  done: false,
  errors: [],
};

function addLetter(state, letter) {
  const { guess, words } = state;
  const word = words[guess];

  if (word.length < 5) {
    words[guess] = word + letter;
    return { ...state, words: words };
  } else {
    return { ...state, errors: [...state.errors, "No more room"] };
  }
}

const removeLetter = (state) => {
  const { guess, words } = state;
  const word = words[guess];

  if (word.length > 0) {
    words[guess] = word.slice(0, -1);
    return { ...state, words: words };
  } else {
    return { ...state, errors: [...state.errors, "Nothing to remove"] };
  }
};

const submitWord = (state) => {
  const { wordle, words, guess } = state;
  const word = words[guess];

  if (dictionary.includes(word)) {
    return {
      ...state,
      guess: guess + 1,
      done: word === wordle || guess === words.length - 1,
    };
  } else {
    if (words[guess].length === 5) {
      return { ...state, errors: [...state.errors, "Not a word"] };
    } else {
      return { ...state, errors: [...state.errors, "More letters required"] };
    }
  }
};

const inputReducer = (state, { type, key }) => {
  switch (type) {
    case "ADD_LETTER":
      return addLetter(state, key);
    case "REMOVE_LETTER":
      return removeLetter(state);
    case "SUBMIT_WORD":
      return submitWord(state);
    case "PLAY_AGAIN":
      return { ...initialState, words: Array(6).fill("") };
    case "REMOVE_ERROR":
      return {
        ...state,
        errors: state.errors.slice(0, -1),
      };
    default:
      return state;
  }
};

export default function Wordle() {
  const [state, dispatch] = useReducer(inputReducer, initialState);

  useEffect(() => {
    if (state.done) {
      return;
    }

    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();

      if (ALPHABET.includes(key)) {
        dispatch({ type: "ADD_LETTER", key: key });
      } else if (DELETE_KEYS.includes(key)) {
        dispatch({ type: "REMOVE_LETTER" });
      } else if (SUBMIT_KEY === key) {
        dispatch({ type: "SUBMIT_WORD" });
      }
    };

    window.addEventListener("keyup", handleKeyPress);
    return () => window.removeEventListener("keyup", handleKeyPress);
  }, [state.done]);

  useEffect(() => {
    if (state.errors.length === 0) {
      return;
    }
    setTimeout(() => {
      dispatch({ type: "REMOVE_ERROR" });
    }, 1000);
  }, [state.errors]);

  return (
    <React.Fragment>
      <div className="layout">
        <div className="header">
          <h2 className="title">WORDLE</h2>
        </div>
        <div className="main">
          <Board state={state} />
        </div>
        <div className="side">
          <Code value={state} />
        </div>
        <div className="footer">
          <Keyboard state={state} dispatch={dispatch} />
        </div>
      </div>
      {state.done && (
        <div className="modal" onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
          <div className="modal-body">
            <h1>
              {state.wordle === state.words[state.guess - 1]
                ? "Winner"
                : "Unlucky"}
            </h1>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

const Code = (props) => (
  <pre>
    {JSON.stringify(
      props.value,
      (key, value) => {
        return key === "wordle" ? "*****" : value;
      },
      "  "
    )}
  </pre>
);

const Board = (props) => {
  const state = props.state;
  return (
    <div className="board">
      {[...state.words].map((word, index) => {
        const hints = index < state.guess ? giveHints(state.wordle, word) : [];
        const shake = state.guess === index && state.errors.length > 0;
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
  <div className={`word ${props.shake && "shake"}`}>{props.children}</div>
);

const Letter = (props) => (
  <div className="letter" style={styles[props.color]}>
    {props.children}
  </div>
);
