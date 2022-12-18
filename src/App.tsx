import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useInterval } from "./timer";
import "./App.css";

export default function App() {
  const [isTiming, setIstiming] = useState(false);

  const [elapsedMilliSecondsFromStart, setElapsedMilliSecondsFromStart] =
    useState(0);
  const [elapsedMilliSecondsToLapStart, setElapsedMilliSecondsToLapStart] =
    useState(0);
  const [laps, setLaps] = useState<number[]>([]);

  const [desiredSeconds, setDesiredSeconds] = useState(16);
  const [desiredTenths, setDesiredTenths] = useState(5);
  const [desiredLapTimeInMilliSeconds, setDesiredLapTimeInMilliSeconds] =
    useState(0);
  const [
    acceptablePacingDeviationPercent,
    setAcceptablePacingDeviationPercent,
  ] = useState(10);

  const [cssClass, setCssClass] = useState<"under" | "on" | "over">();

  const timerHandler = useCallback(() => {
    const newTime = elapsedMilliSecondsFromStart + 10;
    setElapsedMilliSecondsFromStart(newTime);
  }, [elapsedMilliSecondsFromStart]);

  useInterval(timerHandler, isTiming ? 10 : null);

  const startTimer = useCallback(() => {
    setIstiming(true);
    setElapsedMilliSecondsFromStart(0);
    setElapsedMilliSecondsToLapStart(0);
    setLaps([]);
    setCssClass(undefined);
  }, []);

  const registerLap = useCallback(() => {
    const lapTime =
      elapsedMilliSecondsFromStart - elapsedMilliSecondsToLapStart;
    setElapsedMilliSecondsToLapStart(
      laps.length ? elapsedMilliSecondsToLapStart + lapTime : lapTime
    );
    setLaps([...laps, lapTime]);
  }, [elapsedMilliSecondsFromStart, elapsedMilliSecondsToLapStart, laps]);

  const stopTimer = useCallback(() => {
    if(isTiming) {
      setIstiming(false);
      registerLap();
    }
  }, [isTiming, registerLap]);

  const onSecondsChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDesiredSeconds(+e.target.value);
    },
    []
  );

  const onTenthsChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDesiredTenths(+e.target.value);
    },
    []
  );

  const onPacingDeviationChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAcceptablePacingDeviationPercent(+e.target.value);
    },
    []
  );

  useEffect(() => {
    setDesiredLapTimeInMilliSeconds(
      desiredSeconds * 1000 + desiredTenths * 100
    );
  }, [desiredSeconds, desiredTenths]);

  const formatMillisecondsAsSecondsAndTenths = useMemo(() => (milliSeconds: number) =>
    (milliSeconds / 1000).toFixed(2), []);

  useEffect(() => {
    if (laps.length) {
      const offsetPercent =
        (desiredLapTimeInMilliSeconds / laps[laps.length - 1]) * 100 - 100;
      if (Math.abs(offsetPercent) <= acceptablePacingDeviationPercent) {
        setCssClass("on");
      } else if (offsetPercent > acceptablePacingDeviationPercent) {
        setCssClass("over");
      } else if (offsetPercent < acceptablePacingDeviationPercent) {
        setCssClass("under");
      }
    }
  }, [laps, desiredLapTimeInMilliSeconds, acceptablePacingDeviationPercent]);

  return (
    <div className="App">
      <div id="settings">
        <label>
          Seconds
          <input
            value={desiredSeconds}
            type="range"
            min={0}
            max={59}
            step={1}
            onChange={onSecondsChanged}
            disabled={isTiming}
          />
          <span>{desiredSeconds}</span>
        </label>
        <label>
          Tenths
          <input
            value={desiredTenths}
            type="range"
            min={0}
            max={9}
            step={1}
            onChange={onTenthsChanged}
            disabled={isTiming}
          />
          <span>{desiredTenths}</span>
        </label>
        <label>
          Acceptable pacing deviation
          <input
            value={acceptablePacingDeviationPercent}
            type="range"
            min={0}
            max={9}
            step={1}
            onChange={onPacingDeviationChanged}
            disabled={isTiming}
          />
          <span>{acceptablePacingDeviationPercent}</span>
          %
        </label>
      </div>
      <div id="timer" className={cssClass}>
         {formatMillisecondsAsSecondsAndTenths(
            isTiming ? elapsedMilliSecondsFromStart - elapsedMilliSecondsToLapStart : elapsedMilliSecondsFromStart
          )}
      </div>
      <div id="buttons">
        <button disabled={isTiming} onClick={startTimer}>
          Start
        </button>
        <button onClick={stopTimer}>Stop</button>
        <button disabled={!isTiming} onClick={registerLap}>
          Lap
        </button>
      </div>
      <ul id="laps">
        {laps.map((number) => (
          <li>{formatMillisecondsAsSecondsAndTenths(number)}</li>
        ))}
      </ul>
    </div>
  );
}
