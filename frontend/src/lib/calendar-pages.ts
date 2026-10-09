import type { EventKind } from "../services/calendar";

export const CAL_YEARS = [2026, 2027];
export const CAL_KINDS: EventKind[] = ["ekadashi", "amavasya", "purnima"];
export const DELHI = { latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };

export const KIND_META: Record<EventKind, { label: string; hindi: string; intro: string }> = {
  ekadashi: {
    label: "Ekadashi",
    hindi: "एकादशी",
    intro:
      "Ekadashi is the 11th tithi of each lunar fortnight, so it occurs about twice a month. Devotees of Vishnu fast on it; the fast is broken (parana) after sunrise the next day.",
  },
  amavasya: {
    label: "Amavasya",
    hindi: "अमावस्या",
    intro:
      "Amavasya is the new-moon tithi, the 30th tithi of the lunar month. It is observed for pitru tarpan and shraddha; Amavasya on a Monday is Somvati Amavasya and on a Saturday Shani Amavasya.",
  },
  purnima: {
    label: "Purnima",
    hindi: "पूर्णिमा",
    intro:
      "Purnima is the full-moon tithi, the 15th tithi of the bright fortnight. The Purnima vrat and Satyanarayan puja are kept on the day the tithi prevails in the afternoon; holy bathing and charity (snan-daan) on the day it prevails at sunrise.",
  },
};
