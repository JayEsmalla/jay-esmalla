import { useContext } from "react";
import { motion } from "framer-motion";
import { VisitorContext } from "@/lib/visitors";
import { motionTokens, useMotionSettings } from "@/lib/motion";

export default function VisitorCounter() {
  const counts = useContext(VisitorContext);
  const { reduced } = useMotionSettings();
  return (
    <div className="mt-5 min-h-5">
      {counts && (
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : motionTokens.feedback }}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-retro text-[11px] leading-5 text-muted-foreground sm:text-xs"
          title="Approximate active sessions in the last 90 seconds. Visits count browsing sessions, restarting after 30 minutes of inactivity."
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-pulse-green)]" />
            <span><span className="tabular-nums text-foreground">{counts.active.toLocaleString("en-US")}</span> active now</span>
          </span>
          <span aria-hidden="true" className="text-muted-foreground/50">·</span>
          <span><span className="tabular-nums text-foreground">{counts.visits.toLocaleString("en-US")}</span> visits</span>
        </motion.p>
      )}
    </div>
  );
}
