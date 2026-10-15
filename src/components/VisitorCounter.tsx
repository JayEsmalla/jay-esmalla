import { useContext } from "react";
import { motion } from "framer-motion";
import { shouldTrackVisitors, VisitorContext } from "@/lib/visitors";
import { motionTokens, useMotionSettings } from "@/lib/motion";

function viewerAvatars(seeds: string[]) {
  const avatars = new Map<string, number>();
  const used = new Set<number>();
  // Resolve collisions in seed order so the visible sample always has distinct
  // portraits and keeps its assignments when the API changes the display order.
  [...seeds].sort().forEach((seed) => {
    let avatar = parseInt(seed.slice(0, 8), 16) % 3;
    while (used.has(avatar)) avatar = (avatar + 1) % 3;
    used.add(avatar);
    avatars.set(seed, avatar);
  });
  return avatars;
}

export default function VisitorCounter() {
  const counts = useContext(VisitorContext);
  const { reduced } = useMotionSettings();
  const activeLabel = counts ? counts.active >= 3 ? "3+" : String(counts.active) : "—";
  const viewerSeeds = counts?.viewers?.slice(0, 3) ?? [];
  const avatars = viewerAvatars(viewerSeeds);
  const peopleLabel = counts?.active === 1 ? "person viewing now" : "people viewing now";
  const live = shouldTrackVisitors(import.meta.env.PROD, window.location.origin);
  const description = counts
    ? "Updates every 15 seconds while this page is visible. Approximate active sessions in the last 90 seconds. Illustrated avatars represent up to three anonymous viewers; they are not visitors' real photos. Visits restart after 30 minutes away."
    : live ? "Live viewer statistics are temporarily unavailable."
      : "Live viewer statistics appear on the published portfolio. Local previews do not record visits.";
  return (
    <div className="mt-5 min-h-[60px]">
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : motionTokens.feedback }}
          className="flex flex-col items-start gap-2 font-mono-retro text-[11px] leading-5 text-muted-foreground sm:text-xs"
          title={description}
        >
          <span aria-hidden="true" className="isolate inline-flex -space-x-2">
            {viewerSeeds.length ? viewerSeeds.map((seed) => (
              <span key={seed} className="relative h-8 w-8 shrink-0 rounded-full border border-ash/30 bg-carbon p-0.5 ring-2 ring-carbon">
                <img src="/viewer-avatars.webp" alt="" width="32" height="32" draggable={false} decoding="async" className="h-full w-full rounded-full object-cover" style={{ objectPosition: `${(avatars.get(seed) ?? 0) * 50}% 50%` }} />
                <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-carbon bg-pulse-green" />
              </span>
            )) : <span className="h-8 w-8 rounded-full border border-ash/20 bg-graphite/30" />}
          </span>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><span className="tabular-nums text-foreground">{activeLabel}</span> {peopleLabel}</span>
            <span aria-hidden="true" className="text-muted-foreground/50">·</span>
            <span className="inline-flex items-center gap-1.5">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="m1.5 8 4-3.5h5l4 3.5-4 3.5h-5Z" />
                <circle cx="8" cy="8" r="1.75" />
              </svg>
              <span><span className="tabular-nums text-foreground">{counts ? counts.visits.toLocaleString("en-US") : "—"}</span> visits</span>
            </span>
          </p>
        </motion.div>
    </div>
  );
}
