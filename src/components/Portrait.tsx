import { useState } from "react";
import { useTheme } from "next-themes";

type Theme = "dark" | "light";
type ImageState = "loading" | "ready" | "missing";
const portraits: Record<Theme, string> = { dark: "/profile.webp", light: "/white-ver.jpg" };

export default function Portrait() {
  const { resolvedTheme } = useTheme();
  const theme: Theme = resolvedTheme === "light" ? "light" : "dark";
  const [images, setImages] = useState<Record<Theme, ImageState>>({ dark: "loading", light: "loading" });
  const updateImage = (mode: Theme, state: ImageState) => setImages((current) => ({ ...current, [mode]: state }));
  const loaded = async (mode: Theme, image: HTMLImageElement) => {
    try {
      await image.decode?.();
      updateImage(mode, "ready");
    } catch {
      updateImage(mode, "missing");
    }
  };

  return <figure
    aria-label="Portrait of Jay Factolarin Esmalla"
    data-portrait-theme={theme}
    className="portrait-frame relative mx-auto aspect-[3/4] w-full max-w-[195px] overflow-hidden rounded-[8px] border border-graphite bg-portrait-surface sm:max-w-[240px] lg:mx-0 lg:max-w-none"
  >
    {images[theme] !== "ready" && <div className="absolute inset-0 grid place-items-center" role="status">
      <div className="text-center">
        <span aria-hidden="true" className="block text-[42px] font-normal tracking-[-0.05em] text-chalk">JE</span>
        <span className="mt-2 block text-[12px] text-smoke">{images[theme] === "missing" ? "Portrait unavailable" : "Loading portrait"}</span>
      </div>
    </div>}

    {/* Both small assets load and decode ahead of interaction, with one fixed frame. */}
    {(Object.keys(portraits) as Theme[]).map((mode) => <img
      key={mode}
      src={portraits[mode]}
      alt=""
      aria-hidden="true"
      data-theme-portrait={mode}
      data-portrait-state={images[mode]}
      width={720} height={720}
      {...{ fetchpriority: "high" }}
      loading="eager" decoding="async"
      onLoad={(event) => { void loaded(mode, event.currentTarget); }}
      onError={() => updateImage(mode, "missing")}
      className="portrait-image absolute inset-0 h-full w-full object-cover object-center"
    />)}

    <figcaption className="portrait-caption absolute inset-x-0 bottom-0 px-3 pb-3 pt-12 lg:px-4 lg:pb-4">
      <p className="text-[12px] font-normal leading-snug text-chalk lg:text-[13px]">Jay Factolarin Esmalla</p>
      <p className="meta-text mt-1 text-smoke">CS / AI · Tagum City, PH</p>
    </figcaption>
  </figure>;
}
