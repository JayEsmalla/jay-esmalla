import { useContext } from "react";
import { motion } from "framer-motion";
import { shouldTrackVisitors, VisitorContext } from "@/lib/visitors";
import { motionTokens, useMotionSettings } from "@/lib/motion";

function ViewerGlyph({ seed }: { seed?: string }) {
  const cells = seed ? Array.from({ length: 25 }, (_, cell) => cell).filter((cell) => cell === 12 || (parseInt(seed[Math.floor(cell / 4)], 16) & (1 << (cell % 4))) !== 0) : [];
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.25" strokeLinecap="square">
    <path d="M7 2H2v5M2 17v5h5M17 22h5v-5" stroke="currentColor" className="text-iron" />
    <path d="M17 2h5v5" stroke="currentColor" />
    {seed ? <g fill="currentColor" className="text-chalk" shapeRendering="crispEdges">
      {cells.map((cell) => <rect key={cell} x={6 + cell % 5 * 2.5} y={6 + Math.floor(cell / 5) * 2.5} width="1.5" height="1.5" className={cell === 12 ? "text-pulse-green" : undefined} />)}
    </g> : <g stroke="currentColor" className="text-chalk">
      <circle cx="12" cy="9" r="2.5" />
      <path d="M7.5 18v-1a4.5 4.5 0 0 1 9 0v1" />
    </g>}
  </svg>;
}

export default function VisitorCounter() {
  const counts = useContext(VisitorContext);
  const { reduced } = useMotionSettings();
  const activeLabel = counts ? counts.active >= 3 ? "3+" : String(counts.active) : "—";
  // Each public seed identifies an anonymous active session, not an icon slot.
  const viewerSeeds = counts?.viewers?.length ? counts.viewers.slice(0, 3) : [undefined];
  const live = shouldTrackVisitors(import.meta.env.PROD, window.location.origin);
  const description = counts
    ? "Approximate active sessions in the last 90 seconds. Icons represent up to three recently active anonymous viewers and rotate daily. Visits restart after 30 minutes of inactivity."
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
            <span aria-hidden="true" className={`inline-flex -space-x-1 ${counts ? "text-pulse-green" : "text-smoke"}`}>
              {viewerSeeds.map((seed) => (
                <span key={seed ?? "unavailable"} className="grid h-6 w-6 shrink-0 place-items-center bg-carbon">
                  <ViewerGlyph seed={seed} />
                </span>
              ))}
            </span>
            <span><span className="tabular-nums text-foreground">{activeLabel}</span> active now</span>
          </span>
          <span aria-hidden="true" className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1.5">
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="m1.5 8 4-3.5h5l4 3.5-4 3.5h-5Z" />
              <circle cx="8" cy="8" r="1.75" />
            </svg>
            <span><span className="tabular-nums text-foreground">{counts ? counts.visits.toLocaleString("en-US") : "—"}</span> visits</span>
          </span>
        </motion.p>
    </div>
  );
}
