//todo add option for playing without timer
//todo fix lose game
//todo write a proper read me file
//todo Add a status message for when a correct letter is clicked

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useEffectEvent } from "react";
import Confetti from "react-confetti";
import Header from "./Header.jsx";
import { languages } from "./languages.js";
import { getFarewellText, randomWord } from "./utils.js";

// constants
const time = 60;

export default function AssemblyEndGame() {
  // states
  const [currentWord, setCurrentWord] = useState(() => randomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [counter, setCounter] = useState(time);
  const [isRunning, setIsRunning] = useState(false);
  const [inputValue, setInputValue] = useState(0);

  // derived values
  const handleInputValue = () => {
    const numValue = Number(inputValue);
    if (!numValue || numValue <= 0) return;
    setCounter(numValue);
    setInputValue(0);
  };

  const wrongGuessesCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessesCount + 1 >= languages.length || counter <= 0;
  const isGameOver = isGameLost || isGameWon;
  const numGuessesLeft = languages.length - 1 - wrongGuessesCount;

  //EffectEvents

  const onTick = useEffectEvent(() => {
    setCounter((t) => t - 1);
  });

  //useEffects

  useEffect(() => {
    if (guessedLetters.length > 0 && !isRunning && !isGameOver) {
      setIsRunning(true);
    }
  }, [guessedLetters, isRunning, isGameOver]);

  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const id = setInterval(() => {
      onTick();
    }, 1000);

    const stopTimer = setTimeout(() => {
      clearInterval(id);
      setIsRunning(false);
    }, counter * 1000);

    return () => {
      clearInterval(id);
      clearTimeout(stopTimer);
    };
  }, [isRunning, isGameOver]);

  // static values
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

  const randomMsg = useMemo(
    () => languages.map((lang) => getFarewellText(lang.name)),
    []
  );

  const lettersArray = currentWord.split("");
  const letterElements = lettersArray.map((letter, index) => {
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

  const newGame = () => {
    setIsRunning(false);
    setTimeout(() => {
      setCurrentWord(randomWord());
      setGuessedLetters([]);
      setIsRunning(true);
      setCounter(counter);
    }, 0);
  };

  const tryAgain = () => {
    setIsRunning(false);
    setCounter(time);
    setCurrentWord(randomWord());
    setGuessedLetters([]);
  };
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const lastGuessedLetterCorrect =
    lastGuessedLetter && currentWord.includes(lastGuessedLetter);

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !lastGuessedLetterCorrect && !isGameOver && wrongGuessesCount > 0,
  });

  return (
    <main>
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
      {isGameLost && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center">
            <h2>
              <span role="img" aria-label="skull">
                💀
              </span>
              You lose! Better start learning Assembly
              <span role="img" aria-label="skull">
                💀
              </span>
            </h2>
          </div>
          <button onClick={tryAgain}>try again</button>
        </motion.div>
      )}
      <Header />

      <div className="timer-input">
        <label htmlFor="timer"></label>
        <input
          id="timer"
          value={inputValue}
          disabled={isRunning}
          onChange={(e) => setInputValue(Number(e.target.value))}
          type="number"
          placeholder="set Timer in Seconds"
        ></input>
      </div>

      <section className="timer-button">
        <button
          disabled={isRunning}
          onClick={() => setInputValue(inputValue + 1)}
        >
          +1
        </button>
        <button
          disabled={isRunning}
          onClick={() => setInputValue(inputValue - 1)}
        >
          -1
        </button>
        <button disabled={isRunning} onClick={handleInputValue}>
          Set New Time
        </button>
      </section>
      <section className="time">
        {`Time Remaining ${counter}`} <p>Attempts Left {numGuessesLeft}</p>
      </section>
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
      <section className="word">{letterElements}</section>
      <section className="keyboard">{key}</section>

      <button onClick={!isRunning ? newGame : tryAgain} className="new-game">
        {!isRunning ? "Start Game" : "Restart Game"}
      </button>
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
      ) : !isGameOver ? (
        <>
          <p>{fareWell} </p>
        </>
      ) : null}
    </section>
  );
}
