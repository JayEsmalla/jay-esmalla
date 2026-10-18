import { flushSync } from "react-dom";

let revealing = false;

/** Reveal the complete new palette (including the portrait) from the clicked icon. */
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
  const animations: Animation[] = [];
  let transition: Pick<ViewTransition, "ready" | "finished" | "updateCallbackDone" | "skipTransition"> | undefined;
  let icon: HTMLElement | null = null;
  const skipOnResize = () => transition?.skipTransition();
  trigger.setAttribute("aria-busy", "true");
  try {
    if (reduced || !document.startViewTransition || !root.animate) {
      flushSync(update);
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = Math.min(innerWidth, Math.max(0, Number.isFinite(centerX) ? centerX : innerWidth / 2));
    const y = Math.min(innerHeight, Math.max(0, Number.isFinite(centerY) ? centerY : innerHeight / 2));
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + 2;
    const origin = `${x}px ${y}px`;
    const duration = options.compact ? 400 : 480;
    icon = trigger.querySelector<HTMLElement>(".theme-toggle-glyph");
    root.classList.add("theme-reveal");
    icon?.classList.add("theme-reveal-icon");
    transition = document.startViewTransition(() => {
      applied = true;
      flushSync(update);
    });
    window.addEventListener("resize", skipOnResize, { once: true });
    // Catch both promises even if a background tab skips the reveal.
    void transition.finished.catch(() => {});
    await transition.ready;
    const timeline = document.timeline;
    const startTime = timeline?.currentTime;
    const animateSnapshot = (frames: Keyframe[] | PropertyIndexedKeyframes, pseudoElement: string, effectDuration = duration, easing = "cubic-bezier(.4, 0, .2, 1)") => {
      const animation = root.animate(frames, {
        duration: effectDuration,
        easing,
        fill: "both",
        pseudoElement,
        ...(timeline ? { timeline } : {}),
      });
      animations.push(animation);
      // The icon and expanding snapshot share one clock; no per-frame React work.
      if (startTime != null) animation.startTime = startTime;
    };
    animateSnapshot({ clipPath: [`circle(0px at ${origin})`, `circle(${radius}px at ${origin})`] }, "::view-transition-new(root)");
    if (icon) {
      animateSnapshot({ opacity: [1, 0], transform: ["rotate(0deg) scale(1)", "rotate(90deg) scale(.45)"] }, "::view-transition-old(theme-icon)", 160, "ease-out");
      animateSnapshot([
        { opacity: 0, transform: "rotate(-90deg) scale(.45)", offset: 0 },
        { opacity: 1, transform: "rotate(12deg) scale(1.18)", offset: 0.65 },
        { opacity: 1, transform: "rotate(0deg) scale(1)", offset: 1 },
      ], "::view-transition-new(theme-icon)", Math.min(duration, 360), "cubic-bezier(.22, 1, .36, 1)");
    }
    await transition.finished;
  } catch {
    transition?.skipTransition();
    if (transition) await transition.updateCallbackDone.catch(() => {});
    if (!applied) flushSync(update);
  } finally {
    // Filled effects must not remain attached to the root after snapshots vanish.
    animations.forEach((animation) => animation.cancel());
    window.removeEventListener("resize", skipOnResize);
    icon?.classList.remove("theme-reveal-icon");
    root.classList.remove("theme-reveal");
    trigger.removeAttribute("aria-busy");
    revealing = false;
  }
}
