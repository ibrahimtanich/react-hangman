import React from "react";

export default function Timer() {
  const [counter, setCounter] = React.useState(60);
  React.useEffect(() => {
    const myInterval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    const stopTimeout = setTimeout(() => {
      clearInterval(myInterval);
      console.log("Interval stopped.");
    }, 60000);
    return () => {
      clearInterval(myInterval);
      clearTimeout(stopTimeout);
    };
  }, []);

  return <div className="timer">{counter}</div>;
}
