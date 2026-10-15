import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { motionTokens, useMotionSettings } from "@/lib/motion";

type Mode = "real" | "anime";
type ImageState = "loading" | "ready" | "missing";
const hidden = "polygon(0% 0%, 0% 0%, -20% 100%, 0% 100%)";
const revealed = "polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)";

export default function Portrait() {
  const { reduced } = useMotionSettings();
  const [images, setImages] = useState<Record<Mode, ImageState>>({ real: "loading", anime: "loading" });
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const requested = hovered || pinned;
  const showAnime = requested && images.anime === "ready";
  const duration = reduced ? 0 : motionTokens.headline;

  const updateImage = (mode: Mode, state: ImageState) => setImages((current) => ({ ...current, [mode]: state }));
  const loaded = (mode: Mode, image: HTMLImageElement) => {
    // Keep the real portrait visible until the alternate bitmap is decoded.
    if (typeof image.decode === "function") {
      void image.decode().then(() => updateImage(mode, "ready"), () => updateImage(mode, "missing"));
    } else updateImage(mode, "ready");
  };

  return <button
    type="button"
    className="group relative block w-full select-none overflow-hidden rounded-[8px] border border-graphite bg-portrait-surface text-left transition-colors hover:border-iron"
    style={{ aspectRatio: "3 / 4" }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onClick={() => { setPinned((current) => !current); setHovered(false); }}
    aria-label="Toggle anime alter-ego portrait"
    aria-pressed={pinned && showAnime}
    data-cursor="portrait"
  >
    {images.real !== "ready" && !showAnime && <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <span className="text-center">
        <span className="block text-[52px] font-normal tracking-[-0.05em] text-chalk">JE</span>
        <span className="mt-2 block text-[12px] text-smoke">{images.real === "missing" ? "Portrait unavailable" : "Loading portrait"}</span>
      </span>
    </span>}

    {/* Both layers stay mounted, including through interrupted/reversed reveals. */}
    <motion.img
      src="/profile.webp"
      alt="Portrait of Jay Factolarin Esmalla"
      aria-hidden={showAnime || images.real !== "ready"}
      {...{ fetchpriority: "high" }}
      loading="eager" decoding="async"
      onLoad={(event) => loaded("real", event.currentTarget)}
      onError={() => updateImage("real", "missing")}
      initial={false}
      animate={{ opacity: images.real === "ready" ? 1 : 0, scale: showAnime && !reduced ? 1.035 : 1 }}
      transition={{ duration, ease: motionTokens.ease }}
      className="absolute inset-0 h-full w-full object-cover object-center grayscale contrast-[1.04] brightness-[0.92]"
    />
    <motion.span
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ clipPath: showAnime ? revealed : hidden }}
      transition={{ duration, ease: motionTokens.ease }}
    >
      <motion.img
        src="/gunpark_v2.jpg"
        alt="Gun Park, Jay's anime alter-ego"
        aria-hidden={!showAnime}
        {...{ fetchpriority: "low" }}
        loading="eager" decoding="async"
        onLoad={(event) => loaded("anime", event.currentTarget)}
        onError={() => updateImage("anime", "missing")}
        initial={false}
        animate={{ opacity: images.anime === "ready" ? 1 : 0, scale: showAnime || reduced ? 1 : 1.055 }}
        transition={{ duration, ease: motionTokens.ease }}
        className="absolute inset-0 h-full w-full object-cover object-center contrast-[1.06] brightness-[0.96]"
      />
    </motion.span>

    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pb-4 pt-14">
      <div className="flex items-end justify-between gap-3">
        <div className="min-h-[39px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={showAnime ? "anime" : "real"}
              initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -3 }}
              transition={{ duration: reduced ? 0 : motionTokens.feedback, ease: motionTokens.ease }}>
              <p className="text-[13px] font-normal leading-snug text-white/90">{showAnime ? "Gun Park / Lookism" : "Jay Factolarin Esmalla"}</p>
              <p className="meta-text mt-1 text-white/50">{showAnime ? "Alter ego · CS / AI" : "CS / AI · Tagum City, PH"}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="shrink-0 rounded-[4px] border border-white/20 bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-sm">
          {requested && images.anime === "missing" ? "UNAVAILABLE" : requested && images.anime === "loading" ? "LOADING" : pinned ? "← BACK" : "ALTER EGO"}
        </span>
      </div>
    </div>
  </button>;
}
