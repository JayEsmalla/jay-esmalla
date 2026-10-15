import { flushSync } from "react-dom";

let revealing = false;

/** Reveal the same mounted page; color fades cover older browsers. */
export async function revealTheme(trigger: HTMLElement, update: () => void, reduced: boolean) {
  if (revealing) return;
  const root = document.documentElement;
  if (reduced || !document.startViewTransition || !root.animate) {
    update();
    return;
  }
  const rect = trigger.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  revealing = true;
  let applied = false;
  let transition: Pick<ViewTransition, "ready" | "finished" | "updateCallbackDone" | "skipTransition"> | undefined;
  root.classList.add("theme-reveal");
  try {
    transition = document.startViewTransition(() => {
      applied = true;
      flushSync(update);
    });
    // Catch both promises even if a background tab skips the reveal.
    void transition.finished.catch(() => {});
    await transition.ready;
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, {
      duration: 500,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      pseudoElement: "::view-transition-new(root)",
    });
    await transition.finished;
  } catch {
    transition?.skipTransition();
    if (transition) await transition.updateCallbackDone.catch(() => {});
    if (!applied) update();
  } finally {
    root.classList.remove("theme-reveal");
    revealing = false;
  }
}
