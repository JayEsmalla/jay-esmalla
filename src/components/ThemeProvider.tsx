import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";

function ThemeDocument() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolvedTheme === "light" ? "#f5f4f0" : "#101010");
  }, [resolvedTheme]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => document.documentElement.setAttribute("data-theme-ready", ""));
    return () => { cancelAnimationFrame(frame); document.documentElement.removeAttribute("data-theme-ready"); };
  }, []);
  return null;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <NextThemeProvider attribute="class" storageKey="portfolio-theme" defaultTheme="dark" enableSystem={false} enableColorScheme>
    <ThemeDocument />
    {children}
  </NextThemeProvider>;
}
