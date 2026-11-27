// The home hero entry animation plays once per browser session.
export const HERO_SEEN_KEY = "ws_hero_seen";

// Inline script for the root layout: runs before the first paint, so a returning visitor never
// sees the entry start.
export const HERO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${HERO_SEEN_KEY}"))document.documentElement.classList.add("hero-seen")}catch(e){}`;
