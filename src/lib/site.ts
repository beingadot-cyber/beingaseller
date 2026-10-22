/**
 * Public site address used for SEO (canonical links, sitemap, social previews).
 * Set SITE_URL in Vercel (e.g. https://beingaseller.in) once you connect
 * your own domain — everything updates automatically.
 */
export const SITE_URL = (process.env.SITE_URL || "https://beingaseller.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Beingaseller";
