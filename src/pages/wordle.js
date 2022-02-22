import React, { useEffect, useReducer } from "react";
import dictionary from "../data/five-letter-words.json";
import "../data/styles.css";
import Keyboard from "../components/Keyboard";
import { styles, giveHints } from "../data/wordle-common";

const wordle = "ABUSE";
const maxAttempts = 6;
const initialState = Object.freeze({
  wordle: wordle,
  words: Object.freeze(Array(6).fill("")),
  guess: 0,
  done: false,
  error: Object.freeze([]),
});

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
  const error =
    words[state.guess].length === 0
      ? [...state.error, "No more letters to remove"]
      : state.error;
  words[state.guess] = words[state.guess].slice(0, -1);

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
    <div className="layout">
      <div className="header">
        <h2 className="title">WORDLE</h2>
      </div>
      <div className="main">
        <Board state={state} />
        {state.done && (
          <button onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
            Play Again
          </button>
        )}
      </div>
      <div className="side">
        <pre>
          {JSON.stringify(
            Object.assign({}, state, { wordle: "*****" }),
            null,
            "  "
          )}
        </pre>
      </div>
      <div className="footer">
        <Keyboard state={state} dispatch={dispatch} gameOver={state.done} />
      </div>
    </div>
  );
}

const Board = (props) => {
  const state = props.state;
  return (
    <div className="board">
      {[...state.words].map((word, index) => {
        const hints = index < state.guess ? giveHints(state.wordle, word) : [];
        const shake = state.guess === index && state.error.length > 0;
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
