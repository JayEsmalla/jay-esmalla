import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMotionSettings } from "@/lib/motion";
import { revealTheme } from "@/lib/theme";

export default function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const { reduced, compact } = useMotionSettings();
  const light = resolvedTheme === "light";
  const label = light ? "Switch to dark mode" : "Switch to light mode";
  return <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(event) => {
      const next = light ? "dark" : "light";
      void revealTheme(event.currentTarget, () => setTheme(next), reduced, { compact });
    }}
    className="theme-toggle relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[4px] border border-graphite text-chalk transition-colors hover:border-iron hover:bg-chalk/5"
  >
    <span className="theme-toggle-glyph relative block h-[16px] w-[16px]" aria-hidden="true">
      <Sun className="theme-sun absolute inset-0" size={16} strokeWidth={1.5} />
      <Moon className="theme-moon absolute inset-0" size={16} strokeWidth={1.5} />
    </span>
  </button>;
}
