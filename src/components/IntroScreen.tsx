import { useCallback, useEffect, useRef } from "react";

interface IntroScreenProps {
  onReveal: () => void;
  onComplete: () => void;
}

const IntroScreen = ({ onReveal, onComplete }: IntroScreenProps) => {
  const introRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  const callbacks = useRef({ onReveal, onComplete });
  callbacks.current = { onReveal, onComplete };

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    callbacks.current.onComplete();
  }, []);

  useEffect(() => {
    introRef.current?.focus({ preventScroll: true });
    const revealTimer = window.setTimeout(() => {
      if (!completed.current) callbacks.current.onReveal();
    }, 1700);
    const finishTimer = window.setTimeout(finish, 2400);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => { if (media.matches) finish(); };
    const onKeyDown = (event: KeyboardEvent) => {
      // Let keyboard users continue immediately instead of trapping focus in a screen with no controls.
      if (event.key === "Escape" || event.key === "Tab") { event.preventDefault(); finish(); }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", finish);
    window.addEventListener("hashchange", finish);
    media.addEventListener("change", onMotionChange);
    onMotionChange();
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", finish);
      window.removeEventListener("hashchange", finish);
      media.removeEventListener("change", onMotionChange);
    };
  }, [finish]);

  return (
    <div ref={introRef} tabIndex={-1} className="intro-screen outline-none" role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-describedby="intro-description">
      <h2 id="intro-title" className="sr-only">Welcome to Jay Esmalla’s portfolio</h2>
      <p id="intro-description" className="sr-only">Mobile and web developer in Tagum City. The introduction continues automatically. Press Escape to enter the portfolio immediately.</p>
      <div className="intro-topline">
        <p className="intro-meta">Independent developer<span className="intro-topline-detail"> / Portfolio</span></p>
      </div>
      <div className="intro-center" aria-hidden="true">
        <div className="intro-signature">
          <svg className="intro-drawing" viewBox="0 0 900 240" fill="none" preserveAspectRatio="none">
            <path className="intro-trace" pathLength="1" vectorEffect="non-scaling-stroke" d="M0 192H60V48H840V192H900" />
          </svg>
          <span className="intro-drawing-point" />
          <div className="intro-name-mask"><p className="intro-name">Jay <span>Esmalla.</span></p></div>
          <p className="intro-meta intro-role">Mobile + web developer</p>
        </div>
      </div>
      <div className="intro-bottomline" aria-hidden="true">
        <span className="intro-meta">Thoughtfully built.</span>
        <span className="intro-meta">Tagum City, PH</span>
      </div>
    </div>
  );
};

export default IntroScreen;
