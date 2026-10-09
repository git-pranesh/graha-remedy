import type { Metadata } from "next";

/** canonical + hreflang alternates for an English page and its Hindi counterpart. */
export function hreflang(enPath: string, hiPath: string, current: "en" | "hi"): NonNullable<Metadata["alternates"]> {
  return {
    canonical: current === "en" ? enPath : hiPath,
    languages: { en: enPath, hi: hiPath, "x-default": enPath },
  };
}
