import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const INTERACTIVE = 'a[href], button, [role="button"], summary';
const NATIVE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-native-cursor]';

export default function FocusCursor({ enabled }: { enabled: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const frame = frameRef.current;
    if (!cursor || !dot || !frame) return;

    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation = 0;
    let lastTime = 0;
    let x = 0;
    let y = 0;
    let followX = 0;
    let followY = 0;
    let visible = false;

    const hide = () => {
      visible = false;
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
      document.documentElement.classList.remove("focus-cursor-active");
      cancelAnimationFrame(animation);
      animation = 0;
    };
    const follow = (time: number) => {
      const blend = 1 - Math.exp(-Math.min(time - lastTime, 64) / 45);
      lastTime = time;
      followX += (x - followX) * blend;
      followY += (y - followY) * blend;
      frame.style.transform = `translate3d(${followX}px, ${followY}px, 0)`;
      animation = Math.abs(x - followX) + Math.abs(y - followY) > 0.1
        ? requestAnimationFrame(follow) : 0;
    };
    const move = (event: PointerEvent) => {
      if (!mouse.matches || reduced.matches || event.pointerType !== "mouse") return hide();
      const target = event.target instanceof Element ? event.target : null;
      const action = target?.closest(INTERACTIVE);
      const native = target?.closest(NATIVE)
        || action?.matches(':disabled, [aria-disabled="true"]')
        || (!action && target?.closest('p, h1, h2, h3, h4, li, blockquote, pre, code, label'));
      if (!target || native) return hide();

      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.dataset.mode = action?.getAttribute("data-cursor") ?? (action ? "action" : "default");
      if (!visible) {
        followX = x;
        followY = y;
        frame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        visible = true;
        cursor.dataset.visible = "true";
        document.documentElement.classList.add("focus-cursor-active");
      }
      if (!animation) {
        lastTime = performance.now();
        animation = requestAnimationFrame(follow);
      }
    };
    const press = () => { if (visible) cursor.dataset.pressed = "true"; };
    const release = () => { cursor.dataset.pressed = "false"; };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const key = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") hide(); };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", move, { passive: true });
    document.addEventListener("pointerdown", press);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", hide);
    document.addEventListener("pointerout", leave);
    document.addEventListener("keydown", key, true);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    mouse.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", move);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      mouse.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
    };
  }, [enabled]);

  return createPortal(
    <div ref={cursorRef} className="focus-cursor" data-visible="false" aria-hidden="true">
      <div ref={dotRef} className="focus-cursor-position"><span className="focus-cursor-dot" /></div>
      <div ref={frameRef} className="focus-cursor-position">
        <span className="focus-cursor-brackets"><i /><i /><i /><i /></span>
        <svg className="focus-cursor-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </div>, document.body,
  );
}
