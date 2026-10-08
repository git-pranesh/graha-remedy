"use client";

import { useEffect } from "react";

/**
 * Pages are cached for a few minutes. If a cached copy is from an earlier local date
 * (e.g. served just after midnight), reload once to fetch the regenerated page.
 */
export default function StaleGuard({ date, timezone }: { date: string; timezone: string }) {
  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    if (today === date) return;
    const key = `stale-reload:${location.pathname}:${today}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const t = setTimeout(() => location.reload(), 1500);
    return () => clearTimeout(t);
  }, [date, timezone]);
  return null;
}
