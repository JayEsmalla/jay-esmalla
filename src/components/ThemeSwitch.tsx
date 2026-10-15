import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMotionSettings } from "@/lib/motion";
import { revealTheme } from "@/lib/theme";

export default function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const { reduced } = useMotionSettings();
  const light = resolvedTheme === "light";
  const label = light ? "Switch to dark mode" : "Switch to light mode";
  return <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(event) => { void revealTheme(event.currentTarget, () => setTheme(light ? "dark" : "light"), reduced); }}
    className="theme-toggle relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-graphite text-chalk transition-colors hover:border-iron hover:bg-chalk/5"
  >
    <Sun className="theme-sun absolute" size={17} strokeWidth={1.5} aria-hidden="true" />
    <Moon className="theme-moon absolute" size={17} strokeWidth={1.5} aria-hidden="true" />
  </button>;
}
