/** Only ordinary first-time homepage entries receive the introduction. */
export const shouldPlayIntro = () => {
  if (window.location.pathname !== "/" || window.location.hash) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try { return sessionStorage.getItem("intro-seen") !== "1"; }
  catch { return true; }
};
