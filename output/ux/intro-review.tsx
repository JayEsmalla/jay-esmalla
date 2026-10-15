// Local review fixture only; this is not a portfolio route or production entry.
import React, { useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "/src/App";
import IntroScreen from "/src/components/IntroScreen";
import "/src/index.css";

function Review() {
  const [mode, setMode] = useState<"live" | "frame">("frame");
  const [frame, setFrame] = useState(1250);
  const [run, setRun] = useState(0);
  const [controls, setControls] = useState(true);
  useLayoutEffect(() => {
    if (mode !== "frame") return;
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = frame;
    });
  }, [mode, frame, run]);
  const replay = () => {
    sessionStorage.removeItem("intro-seen");
    history.replaceState({}, "", "/");
    setMode("live");
    setRun((value) => value + 1);
  };
  return <>
    <style>{`
      .review-controls { position:fixed; bottom:6px; left:50%; transform:translateX(-50%); z-index:10001; display:flex; gap:12px; align-items:center; border:1px solid #474747; background:#101010; padding:6px 12px; border-radius:6px; font:11px monospace; color:#f3f3f3; }
      .review-controls button { min-height:32px; white-space:nowrap; }
      body:has(.review-live .intro-screen) .review-controls { visibility:hidden; }
      .review-controls input { width:100px; }
    `}</style>
    <div className={mode === "live" ? "review-live" : "review-frame"}>
      {mode === "live" ? <App key={run} /> : <IntroScreen key={run} onReveal={() => {}} onComplete={() => {}} />}
    </div>
    {controls && <div className="review-controls">
      <button onClick={replay}>Replay intro</button>
      <button onClick={() => { setMode("frame"); setRun((value) => value + 1); }}>Inspect frame</button>
      <button onClick={() => setControls(false)}>Hide controls</button>
      {mode === "frame" && <><input aria-label="Animation time" type="range" min="0" max="2400" step="50" value={frame} onChange={(event) => setFrame(Number(event.target.value))} /><span>{frame} ms</span></>}
    </div>}
  </>;
}
createRoot(document.getElementById("review-root")!).render(<Review />);
