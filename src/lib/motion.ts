import { createContext, useContext, useSyncExternalStore } from "react";
import type { MotionProps } from "framer-motion";

export const motionTokens = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  feedback: 0.18,
  reveal: 0.5,
  headline: 0.6,
  overlay: 0.22,
  exit: 0.15,
  page: 0.3,
};

export const PageEntranceContext = createContext(false);
const reducedQuery = "(prefers-reduced-motion: reduce)";
const compactQuery = "(max-width: 767px)";
const subscribe = (query: string, notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const subscribeReduced = (notify: () => void) => subscribe(reducedQuery, notify);
const subscribeCompact = (notify: () => void) => subscribe(compactQuery, notify);
const readReduced = () => window.matchMedia(reducedQuery).matches;
const readCompact = () => window.matchMedia(compactQuery).matches;

export function useMotionSettings() {
  const reduced = useSyncExternalStore(subscribeReduced, readReduced, () => true);
  const compact = useSyncExternalStore(subscribeCompact, readCompact, () => false);
  const pageEntrance = useContext(PageEntranceContext);
  return { reduced, compact, pageEntrance };
}

export function useReveal() {
  const { reduced, compact, pageEntrance } = useMotionSettings();
  return (index = 0, distance = 12): MotionProps => ({
    initial: reduced || pageEntrance ? false : { opacity: 0, y: compact ? distance / 2 : distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: reduced || pageEntrance ? 0 : motionTokens.reveal,
      delay: reduced || pageEntrance ? 0 : Math.min(index * (compact ? 0.03 : 0.06), compact ? 0.09 : 0.18),
      ease: motionTokens.ease,
    },
  });
}
