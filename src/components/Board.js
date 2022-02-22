import React from "react";
import { giveHints, styles } from "../data/wordle-common";

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

export default Board;
