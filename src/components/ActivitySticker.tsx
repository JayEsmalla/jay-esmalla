import { memo, useEffect, useRef, useState } from "react";
import type { ActivityMode } from "@/lib/local-time";

interface ActivityStickerProps {
  activity: ActivityMode;
  label: string;
  size?: "sm" | "md";
  interactive?: boolean;
}

const POKE_BADGE: Record<ActivityMode, string> = {
  sleeping: "?!",
  studying: "★",
  workout: "+1",
  coding: "<3",
};

const ActivitySticker = memo(function ActivitySticker({
  activity,
  label,
  size = "md",
  interactive = true,
}: ActivityStickerProps) {
  const [poked, setPoked] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handlePoke = () => {
    if (!interactive) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setPoked(false);
    window.requestAnimationFrame(() => {
      setPoked(true);
      timerRef.current = window.setTimeout(() => {
        setPoked(false);
        timerRef.current = null;
      }, 650);
    });
  };

  const isSmall = size === "sm";
  const containerClass = isSmall
    ? "relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-[2px] border border-iron/70 bg-[#141414]"
    : "sticker-stage group/sticker relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[4px] border border-iron/80 bg-[#141414] transition-colors hover:border-pulse-green/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pulse-green";

  const svgClass = isSmall
    ? "h-6 w-6 overflow-visible"
    : "h-11 w-11 overflow-visible";

  const content = (
    <>
      {!isSmall && (
        <span
          aria-hidden="true"
          className={`sticker-poke-badge pointer-events-none absolute right-1 top-0.5 z-10 font-mono-retro text-[9px] font-bold leading-none text-pulse-green ${
            poked ? "is-poked" : ""
          }`}
        >
          {POKE_BADGE[activity]}
        </span>
      )}
      <svg
        viewBox="0 0 100 100"
        role={isSmall ? undefined : "img"}
        aria-hidden={isSmall ? "true" : undefined}
        aria-label={isSmall ? undefined : `${label} status sticker`}
        data-sticker-mode={activity}
        className={`${svgClass} ${poked ? "sticker-svg-poked" : ""}`}
      >
        {activity === "sleeping" && <SleepingChibi />}
        {activity === "studying" && <StudyingChibi />}
        {activity === "workout" && <WorkoutChibi />}
        {activity === "coding" && <CodingChibi />}
      </svg>
    </>
  );

  if (!interactive || isSmall) {
    return <div className={containerClass}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={handlePoke}
      title="Poke sticker"
      aria-label={`Poke ${label.toLowerCase()} sticker`}
      className={`${containerClass} cursor-pointer`}
    >
      {content}
    </button>
  );
});

function SleepingChibi() {
  return (
    <>
      <g className="sticker-die-cut">
        {/* Desk surface */}
        <rect
          x="12"
          y="73"
          width="76"
          height="10"
          rx="3"
          fill="#262626"
          stroke="#101010"
          strokeWidth="2.5"
        />
        <g className="sticker-anim-breathe">
          {/* Cozy pillow under head */}
          <rect
            x="24"
            y="60"
            width="52"
            height="14"
            rx="7"
            fill="#e8e8e8"
            stroke="#101010"
            strokeWidth="2.4"
          />
          {/* Hoodie shoulders */}
          <path
            d="M22 73 C22 55, 78 55, 78 73 Z"
            fill="#1e1e1e"
            stroke="#101010"
            strokeWidth="2.5"
          />
          <path
            d="M34 62 Q50 68 66 62"
            fill="none"
            stroke="#98ff38"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Chibi head */}
          <ellipse
            cx="50"
            cy="48"
            rx="22"
            ry="19"
            fill="#f3f3f3"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Fluffy chibi hair */}
          <path
            d="M27 47 C25 30, 42 23, 53 25 C66 24, 75 33, 73 47 C69 39, 62 37, 56 41 C51 35, 43 36, 38 42 C34 38, 29 41, 27 47 Z"
            fill="#141414"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Cute cowlick tuft */}
          <path
            d="M48 25 Q53 17 59 22"
            fill="none"
            stroke="#141414"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Closed happy sleeping eyes */}
          <path
            d="M37 50 Q41.5 54.5 46 50"
            fill="none"
            stroke="#101010"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M54 50 Q58.5 54.5 63 50"
            fill="none"
            stroke="#101010"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Soft blush cheeks */}
          <ellipse cx="34.5" cy="53.5" rx="3.4" ry="1.9" fill="#98ff38" opacity="0.45" />
          <ellipse cx="65.5" cy="53.5" rx="3.4" ry="1.9" fill="#98ff38" opacity="0.45" />
          {/* Expanding sleep bubble */}
          <circle
            cx="63"
            cy="56.5"
            r="4.6"
            fill="#98ff38"
            fillOpacity="0.3"
            stroke="#98ff38"
            strokeWidth="1.7"
            className="sticker-anim-bubble"
          />
          {/* Folded paws on pillow */}
          <circle cx="38" cy="68" r="4" fill="#f3f3f3" stroke="#101010" strokeWidth="2" />
          <circle cx="62" cy="68" r="4" fill="#f3f3f3" stroke="#101010" strokeWidth="2" />
        </g>
      </g>
      {/* Floating Zzz */}
      <text
        x="68"
        y="34"
        fill="#98ff38"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="13"
        className="sticker-anim-zzz-1"
      >
        Z
      </text>
      <text
        x="76"
        y="26"
        fill="#98ff38"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="10"
        className="sticker-anim-zzz-2"
      >
        z
      </text>
    </>
  );
}

function StudyingChibi() {
  return (
    <>
      <g className="sticker-die-cut">
        <g className="sticker-anim-bob">
          {/* Hoodie */}
          <path
            d="M25 76 C25 54, 75 54, 75 76 Z"
            fill="#1e1e1e"
            stroke="#101010"
            strokeWidth="2.5"
          />
          <line
            x1="46"
            y1="58"
            x2="46"
            y2="70"
            stroke="#98ff38"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="58"
            x2="54"
            y2="70"
            stroke="#98ff38"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Chibi head */}
          <ellipse
            cx="50"
            cy="42"
            rx="22"
            ry="20"
            fill="#f3f3f3"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Hair */}
          <path
            d="M27 42 C25 24, 42 18, 53 20 C66 19, 75 28, 73 42 C69 34, 62 32, 56 36 C51 30, 43 31, 38 37 C34 33, 29 36, 27 42 Z"
            fill="#141414"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Soft blush cheeks */}
          <ellipse cx="34" cy="49" rx="3" ry="1.7" fill="#98ff38" opacity="0.38" />
          <ellipse cx="66" cy="49" rx="3" ry="1.7" fill="#98ff38" opacity="0.38" />
          {/* Scanning & blinking eyes behind round glasses */}
          <g className="sticker-anim-scan">
            <g className="sticker-anim-blink">
              <circle cx="42" cy="45" r="3.5" fill="#101010" />
              <circle cx="43.2" cy="43.8" r="1.25" fill="#f3f3f3" />
              <circle cx="58" cy="45" r="3.5" fill="#101010" />
              <circle cx="59.2" cy="43.8" r="1.25" fill="#f3f3f3" />
            </g>
          </g>
          {/* Round frames */}
          <circle cx="42" cy="45" r="6.5" fill="none" stroke="#101010" strokeWidth="1.9" />
          <circle cx="58" cy="45" r="6.5" fill="none" stroke="#101010" strokeWidth="1.9" />
          <line x1="48.5" y1="45" x2="51.5" y2="45" stroke="#101010" strokeWidth="1.9" />
          {/* Cute focused smile */}
          <path
            d="M47.5 53 Q50 55 52.5 53"
            fill="none"
            stroke="#101010"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        {/* Open textbook */}
        <path
          d="M22 76 L50 72 L78 76 L74 84 L50 80 L26 84 Z"
          fill="#f3f3f3"
          stroke="#101010"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <line x1="50" y1="72" x2="50" y2="80" stroke="#101010" strokeWidth="2" />
        <line
          x1="31"
          y1="76"
          x2="45"
          y2="75"
          stroke="#98ff38"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Writing hand + glowing green highlighter */}
        <g className="sticker-anim-pen">
          <line
            x1="32"
            y1="62"
            x2="39"
            y2="75"
            stroke="#98ff38"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="35" cy="70" r="4" fill="#f3f3f3" stroke="#101010" strokeWidth="2" />
        </g>
      </g>
    </>
  );
}

function WorkoutChibi() {
  return (
    <>
      <g className="sticker-die-cut">
        <g className="sticker-anim-bob">
          {/* Hoodie */}
          <path
            d="M28 80 C28 56, 76 56, 76 80 Z"
            fill="#1e1e1e"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Chibi head */}
          <ellipse
            cx="53"
            cy="43"
            rx="21"
            ry="19"
            fill="#f3f3f3"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Hair */}
          <path
            d="M31 42 C29 24, 45 18, 56 20 C68 19, 77 28, 75 42 C71 34, 64 32, 58 36 C53 30, 46 31, 41 37 C37 33, 33 36, 31 42 Z"
            fill="#141414"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Acid-green sweatband */}
          <path
            d="M32 36 Q53 32 74 36"
            fill="none"
            stroke="#98ff38"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Soft blush cheeks */}
          <ellipse cx="38" cy="49" rx="3.2" ry="1.8" fill="#98ff38" opacity="0.45" />
          <ellipse cx="68" cy="49" rx="3.2" ry="1.8" fill="#98ff38" opacity="0.45" />
          {/* Determined cute eyes */}
          <g className="sticker-anim-blink">
            <circle cx="45" cy="45" r="3.4" fill="#101010" />
            <circle cx="46.2" cy="43.8" r="1.2" fill="#f3f3f3" />
            <circle cx="61" cy="45" r="3.4" fill="#101010" />
            <circle cx="62.2" cy="43.8" r="1.2" fill="#f3f3f3" />
          </g>
          <line
            x1="40"
            y1="39"
            x2="48"
            y2="41"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="66"
            y1="39"
            x2="58"
            y2="41"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Energetic grin */}
          <path
            d="M49 52 Q53 55.5 57 52"
            fill="none"
            stroke="#101010"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        {/* Curling arm + dumbbell */}
        <g className="sticker-anim-curl">
          <path d="M36 66 L24 58" stroke="#f3f3f3" strokeWidth="7" strokeLinecap="round" />
          <line
            x1="14"
            y1="52"
            x2="34"
            y2="62"
            stroke="#98ff38"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect
            x="10"
            y="46"
            width="6"
            height="13"
            rx="2"
            transform="rotate(25 13 52)"
            fill="#222222"
            stroke="#101010"
            strokeWidth="2"
          />
          <rect
            x="30"
            y="56"
            width="6"
            height="13"
            rx="2"
            transform="rotate(25 33 62)"
            fill="#222222"
            stroke="#101010"
            strokeWidth="2"
          />
          <circle cx="24" cy="57" r="4" fill="#f3f3f3" stroke="#101010" strokeWidth="2" />
        </g>
      </g>
      {/* Energy sparks */}
      <path d="M18 32 L22 24 L24 32 L18 36 Z" fill="#98ff38" className="sticker-anim-spark" />
      <circle cx="80" cy="30" r="2.2" fill="#98ff38" className="sticker-anim-spark" />
    </>
  );
}

function CodingChibi() {
  return (
    <>
      <g className="sticker-die-cut">
        <g className="sticker-anim-bob">
          {/* Headphones band */}
          <path
            d="M26 42 C26 20, 74 20, 74 42"
            fill="none"
            stroke="#262626"
            strokeWidth="4"
          />
          {/* Hoodie */}
          <path
            d="M25 76 C25 54, 75 54, 75 76 Z"
            fill="#1e1e1e"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Chibi head */}
          <ellipse
            cx="50"
            cy="42"
            rx="21"
            ry="19"
            fill="#f3f3f3"
            stroke="#101010"
            strokeWidth="2.5"
          />
          {/* Headphone ear cups */}
          <rect
            x="23"
            y="36"
            width="6"
            height="13"
            rx="3"
            fill="#1e1e1e"
            stroke="#98ff38"
            strokeWidth="1.8"
          />
          <rect
            x="71"
            y="36"
            width="6"
            height="13"
            rx="3"
            fill="#1e1e1e"
            stroke="#98ff38"
            strokeWidth="1.8"
          />
          {/* Hair */}
          <path
            d="M28 41 C26 24, 42 18, 53 20 C65 19, 74 28, 72 41 C68 33, 61 31, 55 35 C50 29, 43 30, 38 36 C34 32, 30 35, 28 41 Z"
            fill="#141414"
            stroke="#101010"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Soft blush cheeks */}
          <ellipse cx="34.5" cy="49" rx="3" ry="1.7" fill="#98ff38" opacity="0.4" />
          <ellipse cx="65.5" cy="49" rx="3" ry="1.7" fill="#98ff38" opacity="0.4" />
          {/* Sparkling eyes with green screen reflection */}
          <g className="sticker-anim-blink">
            <circle cx="42" cy="45" r="3.6" fill="#101010" />
            <circle cx="43.3" cy="43.8" r="1.3" fill="#98ff38" />
            <circle cx="58" cy="45" r="3.6" fill="#101010" />
            <circle cx="59.3" cy="43.8" r="1.3" fill="#98ff38" />
          </g>
          {/* Cute cat-like :3 smile */}
          <path
            d="M46.5 51.5 Q48.2 53.8 50 51.5 Q51.8 53.8 53.5 51.5"
            fill="none"
            stroke="#101010"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </g>
        {/* Rapidly tapping paws */}
        <circle
          cx="32"
          cy="72"
          r="3.6"
          fill="#f3f3f3"
          stroke="#101010"
          strokeWidth="2"
          className="sticker-anim-tap-l"
        />
        <circle
          cx="68"
          cy="72"
          r="3.6"
          fill="#f3f3f3"
          stroke="#101010"
          strokeWidth="2"
          className="sticker-anim-tap-r"
        />
        {/* Laptop lid in front */}
        <rect
          x="29"
          y="56"
          width="42"
          height="26"
          rx="3"
          fill="#222222"
          stroke="#101010"
          strokeWidth="2.5"
        />
        <line x1="31" y1="57.5" x2="69" y2="57.5" stroke="#98ff38" strokeWidth="2" />
        {/* Glowing </> on laptop */}
        <text
          x="50"
          y="73"
          textAnchor="middle"
          fill="#98ff38"
          fontFamily="monospace"
          fontWeight="bold"
          fontSize="11"
        >
          &lt;/&gt;
        </text>
      </g>
      {/* Floating code particles */}
      <text
        x="15"
        y="34"
        fill="#98ff38"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="10"
        className="sticker-anim-code-1"
      >
        {"{}"}
      </text>
      <text
        x="77"
        y="30"
        fill="#98ff38"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="10"
        className="sticker-anim-code-2"
      >
        ;
      </text>
    </>
  );
}

export default ActivitySticker;

