/**
 * Lightweight GA4 wrapper.
 *
 * GA4 stays completely dormant until a `NEXT_PUBLIC_GA4_ID` env var is provided,
 * so the app works with zero tracking by default. Events are also safe
 * no-ops when the script has not finished loading.
 *
 *   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX npm run dev
 */

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialised = false;

function gtag(...args: unknown[]): void {
  const w = window;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(args);
}

/** Load the gtag script + initialise. Call once at app startup. */
export function initAnalytics(): void {
  if (!GA4_ID || initialised || typeof window === "undefined") return;
  initialised = true;

  const w = window;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = gtag;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", GA4_ID);
}

/** Fire a custom event (no-op unless GA4 is configured). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!GA4_ID || typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params ?? {});
    } else {
      // Queue via dataLayer even before gtag.js finishes loading.
      gtag("event", name, params ?? {});
    }
  } catch {
    /* tracking must never break the app */
  }
}
