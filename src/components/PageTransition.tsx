import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motionTokens, PageEntranceContext, useMotionSettings } from "@/lib/motion";

function PageFrame({ children, pathname, entering }: { children: ReactNode; pathname: string; entering: boolean }) {
  const present = useIsPresent();
  const { reduced } = useMotionSettings();
  return (
    <PageEntranceContext.Provider value={entering}>
      <motion.div
        data-route-path={pathname}
        data-route-exiting={!present || undefined}
        {...(!present ? { inert: "" } : {})}
        aria-hidden={!present || undefined}
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduced ? 1 : 0, transition: { duration: reduced ? 0 : motionTokens.exit, ease: motionTokens.ease } }}
      >
        {children}
      </motion.div>
    </PageEntranceContext.Provider>
  );
}

// Mount inside Suspense so the entrance starts when the page is ready.
export function PageEntrance({ children }: { children: ReactNode }) {
  const { reduced, compact, pageEntrance } = useMotionSettings();
  return <motion.div
    initial={pageEntrance && !reduced ? { opacity: 0, y: compact ? 3 : 6 } : false}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : motionTokens.page, ease: motionTokens.ease }}
  >{children}</motion.div>;
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const firstPath = useRef(pathname);
  const navigated = useRef(false);
  if (pathname !== firstPath.current) navigated.current = true;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageFrame key={pathname} pathname={pathname} entering={navigated.current}>{children}</PageFrame>
    </AnimatePresence>
  );
}
