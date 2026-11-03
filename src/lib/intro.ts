const CRAWLER_USER_AGENT =
  /googlebot|google-extended|googleother|bingbot|slurp|duckduckbot|baiduspider|yandexbot|perplexitybot|oai-searchbot|gptbot|chatgpt-user|claudebot|anthropic-ai|applebot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp|lighthouse/i;

/** Only ordinary first-time homepage entries by human browsers receive the introduction. */
export const shouldPlayIntro = () => {
  if (window.location.pathname !== "/" || window.location.hash) return false;
  if (typeof navigator !== "undefined" && CRAWLER_USER_AGENT.test(navigator.userAgent)) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try { return sessionStorage.getItem("intro-seen") !== "1"; }
  catch { return true; }
};
