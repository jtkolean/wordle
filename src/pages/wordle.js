import React, { useEffect, useReducer, useRef } from "react";
import dictionary from "../data/five-letter-words.json";

const wordle = "ABUSE";
const maxAttempts = 6;
const maxWordLength = 5;
const initialState = { wordle: wordle, word: "", words: [], done: false };

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    width: 500,
    margin: "auto",
    gap: "10px",
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    listStyle: "none",
    gap: "10px",
    height: 75,
    margin: 0,
    padding: 0,
  },
  item: {
    width: 75,
    border: "solid",
    textAlign: "center",
    fontSize: 60,
    minHeight: 69,
  },
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

function giveHints(wordle, word) {
  var hints = Array(maxWordLength).fill("none");

  // LETTER IS IN CORRECT POSITION
  const wordleLeftovers = [...wordle].map((letter, index) => {
    if (letter === word[index]) {
      hints[index] = "correct";
      return "";
    }
    return letter;
  });

  // LETTER IS IN WRONG POSITION
  [...word].forEach((letter, index) => {
    if (hints[index] === "correct") {
      return;
    }
    if (wordleLeftovers.includes(letter)) {
      hints[index] = "wrong";
    }
  });

  return [...hints];
}

function addLetter(state, letter) {
  if (state.word.length < 5) {
    return { ...state, word: state.word.concat(letter) };
  } else {
    return state;
  }
}

function removeLetter(state) {
  return { ...state, word: state.word.slice(0, -1) };
}

function submitWord(state, element) {
  if (dictionary.includes(state.word)) {
    return {
      ...state,
      done:
        state.word === state.wordle || state.words.length + 1 === maxAttempts,
      word: "",
      words: state.words.concat(state.word),
    };
  } else {
    element.style.color = "red";

    setTimeout(() => {
      element.style.color = "";
    }, 400);
    return state;
  }
}

function resetBoard(state) {
  return {
    ...state,
    done: false,
    word: "",
    words: [],
  };
}

function inputReducer(state, action) {
  console.log("useReducer", action.type, action, state);
  switch (action.type) {
    case "ADD_LETTER":
      return addLetter(state, action.key);
    case "REMOVE_LETTER":
      return removeLetter(state);
    case "SUBMIT_WORD":
      return submitWord(state, action.element);
    case "NEXT_WORDLE":
      return resetBoard(state);
    default:
      return state;
  }
}

export default function Wordle() {
  const [state, dispatch] = useReducer(inputReducer, initialState);
  const currentWordReference = useRef(null);

  useEffect(() => {
    if (state.done === false) {
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
            element: currentWordReference.current,
          });
        }
      };
      window.addEventListener("keyup", handleKeyPress);
      return () => window.removeEventListener("keyup", handleKeyPress);
    }
  }, [state.done]);

  const words = [...state.words]
    .map((word, index) => {
      const hints = giveHints(state.wordle, word);
      return {
        letters: [...word].map((letter, i) => {
          return { letter: letter, style: styles[hints[i]] };
        }),
      };
    })
    .concat({
      ref: currentWordReference,
      letters: [...state.word.padEnd(maxWordLength)].map((letter, i) => {
        return { letter: letter };
      }),
    })
    .concat([
      ...Array(maxAttempts).fill({
        letters: Array(maxWordLength).fill({
          letter: "",
        }),
      }),
    ])
    .slice(0, maxAttempts);

  return (
    <main>
      {JSON.stringify(state)}
      {state.done && (
        <button onClick={() => dispatch({ type: "NEXT_WORDLE" })}>
          Play Again
        </button>
      )}

      <div style={styles.column}>
        {[...words].map(({ ref, letters }, index) => (
          <ul key={index} ref={ref} style={styles.container}>
            {letters.map(({ letter, style }, letterIndex) => (
              <li
                key={letterIndex}
                style={Object.assign({}, styles.item, style)}
              >
                {letter}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </main>
  );
}
