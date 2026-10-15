import { useContext } from "react";
import { motion } from "framer-motion";
import { shouldTrackVisitors, VisitorContext } from "@/lib/visitors";
import { motionTokens, useMotionSettings } from "@/lib/motion";

export default function VisitorCounter() {
  const counts = useContext(VisitorContext);
  const { reduced } = useMotionSettings();
  const live = shouldTrackVisitors(import.meta.env.PROD, window.location.origin);
  const description = counts
    ? "Approximate active sessions in the last 90 seconds. Visits count browsing sessions, restarting after 30 minutes of inactivity."
    : live ? "Live viewer statistics are temporarily unavailable."
      : "Live viewer statistics appear on the published portfolio. Local previews do not record visits.";
  return (
    <div className="mt-5 min-h-5">
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : motionTokens.feedback }}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-retro text-[11px] leading-5 text-muted-foreground sm:text-xs"
          title={description}
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${counts ? "bg-pulse-green" : "bg-smoke/50"}`} />
            <span><span className="tabular-nums text-foreground">{counts ? counts.active.toLocaleString("en-US") : "—"}</span> active now</span>
          </span>
          <span aria-hidden="true" className="text-muted-foreground/50">·</span>
          <span><span className="tabular-nums text-foreground">{counts ? counts.visits.toLocaleString("en-US") : "—"}</span> visits</span>
        </motion.p>
    </div>
  );
}
