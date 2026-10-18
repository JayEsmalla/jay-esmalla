import { flushSync } from "react-dom";

let revealing = false;

/** Fade the palette and the fixed portrait frame on the same animation clock. */
export async function revealTheme(
  trigger: HTMLElement,
  update: () => void,
  reduced: boolean,
  options: { compact?: boolean } = {},
) {
  if (revealing) return;
  revealing = true;
  const root = document.documentElement;
  let applied = false;
  let transition: Pick<ViewTransition, "ready" | "finished" | "updateCallbackDone" | "skipTransition"> | undefined;
  trigger.setAttribute("aria-busy", "true");
  try {
    if (reduced || !document.startViewTransition || !root.animate) {
      flushSync(update);
      return;
    }
    root.classList.add("theme-reveal");
    const portrait = document.querySelector<HTMLElement>(".portrait-frame");
    const rect = portrait?.getBoundingClientRect();
    const namedPortrait = portrait && rect && rect.width > 0 && rect.height > 0
      && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth
      && getComputedStyle(portrait).viewTransitionName === "theme-portrait";
    transition = document.startViewTransition(() => {
      applied = true;
      flushSync(update);
    });
    // Catch both promises even if a background tab skips the reveal.
    void transition.finished.catch(() => {});
    await transition.ready;
    const timeline = document.timeline;
    const startTime = timeline?.currentTime;
    const snapshots = namedPortrait ? ["root", "theme-portrait"] : ["root"];
    for (const snapshot of snapshots) {
      const animation = root.animate({ opacity: [0, 1] }, {
        duration: options.compact ? 220 : 260,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        pseudoElement: `::view-transition-new(${snapshot})`,
        ...(timeline ? { timeline } : {}),
      });
      // Both effects begin at precisely the same document-timeline position.
      if (startTime != null) animation.startTime = startTime;
    }
    await transition.finished;
  } catch {
    transition?.skipTransition();
    if (transition) await transition.updateCallbackDone.catch(() => {});
    if (!applied) flushSync(update);
  } finally {
    root.classList.remove("theme-reveal");
    trigger.removeAttribute("aria-busy");
    revealing = false;
  }
}
