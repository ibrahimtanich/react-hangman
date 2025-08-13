import { clsx } from "clsx";
import { useState } from "react";
import Header from "./Header.jsx";
import { languages } from "./languages.js";
import { getFarewellText, randomWord } from "./utils.js";
import Confetti from "react-confetti";

export default function AssemblyEndGame() {
  //states
  const [currentWord, setCurrentWord] = useState(() => randomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);

  //static Values
  const wrongGuessesCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;

  const languageElements = languages.map((lang, index) => {
    const className = index < wrongGuessesCount ? "lost" : "";
    return (
      <span
        className={`chip ${className}`}
        key={lang.name}
        style={{
          backgroundColor: lang.backgroundColor,
          color: lang.color,
        }}
      >
        {lang.name}
      </span>
    );
  });

  const randomMsg = languages.map((lang) => getFarewellText(lang.name));
  const isGameLost = wrongGuessesCount + 1 >= languageElements.length;

  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameOver = isGameLost || isGameWon;
  const lettersArray = currentWord.split("");
  const char = lettersArray.map((letter, index) => {
    const shouldRevealLetters = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    );
    return (
      <span className={letterClassName} key={index}>
        {shouldRevealLetters ? letter.toUpperCase() : ""}
      </span>
    );
  });

  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const keyboardArray = alphabet.split("");
  const key = keyboardArray.map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });
    return (
      <button
        disabled={isGameOver}
        className={className}
        onClick={() => clickedKey(letter)}
        key={letter}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  function clickedKey(letter) {
    setGuessedLetters((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  function newGame() {
    setCurrentWord(randomWord());
    setGuessedLetters([]);
  }
  // derived values
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const lastGuessedLetterCorrect =
    lastGuessedLetter && currentWord.includes(lastGuessedLetter);

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    fareWell: !lastGuessedLetterCorrect && !isGameOver && wrongGuessesCount > 0,
  });

  return (
    <main>
      {isGameWon && <Confetti />}
      <Header />
      {
        <GameState
          isGameOver={isGameOver}
          isGameLost={isGameLost}
          isGameWon={isGameWon}
          className={gameStatusClass}
          fareWell={
            !lastGuessedLetterCorrect && randomMsg[wrongGuessesCount - 1]
          }
        />
      }
      <section className="language-chips">{languageElements}</section>
      <section className="word">{char}</section>
      <section className="keyboard">{key}</section>
      {(isGameLost || isGameWon) && (
        <button onClick={newGame} className="new-game">
          New Game
        </button>
      )}
    </main>
  );
}

function GameState({ isGameOver, isGameLost, isGameWon, className, fareWell }) {
  return (
    <section className={className}>
      {isGameWon ? (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      ) : isGameLost ? (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      ) : !isGameOver ? (
        <>
          <p>{fareWell} </p>
        </>
      ) : null}
    </section>
  );
}
