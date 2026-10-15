// Run before styles and React so the intro starts in the correct theme.
(() => {
  let preference = "dark";
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (["light", "dark"].includes(saved)) preference = saved;
    else if (saved) localStorage.removeItem("portfolio-theme");
  } catch { /* The theme still works for this tab when storage is blocked. */ }
  const resolved = preference;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "light" ? "#f5f4f0" : "#101010");
})();
