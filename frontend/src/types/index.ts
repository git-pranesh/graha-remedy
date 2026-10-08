/* ─── Birth Input ─────────────────────────────────────────────── */

export interface BirthInput {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  /** Optional family deity tradition: shiva, vishnu, devi, ganesha, hanuman */
  kulDevta?: string;
  /** Resolved coordinates from place search (optional). */
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/** A place suggestion from /api/places. */
export interface PlaceSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/* ─── Geo ─────────────────────────────────────────────────────── */

export interface GeoResult {
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/* ─── Astro Chart ─────────────────────────────────────────────── */

export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  sign: string;
  signDegree: string;
  house: number;
  retrograde: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
  nakshatraLord?: string;
}

export interface VideshYoga {
  indicated: boolean;
  strength: "strong" | "moderate" | "weak";
  indicators: string[];
  explanation: string;
}

export interface AstroChart {
  planets: PlanetPosition[];
  houses: { ascendant: number; mc: number; cusps: number[] };
  ayanamsa: number;
  ascendant: {
    longitude: number;
    sign: string;
    signDegree: string;
    nakshatra: string;
    nakshatraPada: number;
  };
  videshYoga: VideshYoga;
}

/* ─── Vimshottari Dasha ───────────────────────────────────────── */

export interface VimshottariDasha {
  moonNakshatra: string;
  moonNakshatraPada: number;
  mahadashaLord: string;
  balanceYears: number;
  mahadashaStart: string;
  mahadashaEnd: string;
  currentAntardasha: string;
  antardashaStart: string;
  antardashaEnd: string;
  sequence: Array<{
    lord: string;
    start: string;
    end: string;
    antardashas: Array<{ lord: string; start: string; end: string }>;
  }>;
}

/* ─── Doshas ──────────────────────────────────────────────────── */

export interface DoshaFlags {
  manglik: boolean;
  manglikDetails: string;
  kaalSarp: boolean;
  kaalSarpDetails: string;
  sadeSati: boolean;
  sadeSatiDetails: string;
  pitra: boolean;
  pitraDetails: string;
  nadi: boolean;
  nadiDetails: string;
}

/* ─── Chart Result ────────────────────────────────────────────── */

export interface ChartResult {
  input: BirthInput;
  geo: GeoResult;
  chart: AstroChart;
  dasha: VimshottariDasha;
  doshas: DoshaFlags;
  computedAt: string;
  cached: boolean;
  currentCity?: string;
  currentLat?: number;
  currentLon?: number;
}

/* ─── Rules Engine ────────────────────────────────────────────── */

export type AfflictionSeverity = "none" | "mild" | "moderate" | "severe";

export interface AfflictionInfo {
  graha: string;
  severity: AfflictionSeverity;
  reasons: string[];
}

export interface RemedyEntry {
  graha: string;
  grahaName: string;
  severity: AfflictionSeverity;
  reasons: string[];
  plainExplanation: string;
  categoryContext: string;
  remedies: {
    mantras: Array<string | { type?: string; name: string; transliteration?: string; practice?: string; level?: string; reference?: string }>;
    mantraTransliteration: string;
    fasting: string[];
    donations: string[];
    pujaSteps: string[];
    temples: string[];
    deity: string;
    deityDescription: string;
  };
}

export interface CategoryResult {
  category: string;
  classicalGrahas: string[];
  afflictedMatched: string[];
  usedFallback: boolean;
  fallbackGraha: string | null;
  remedies: RemedyEntry[];
}

/* ─── Temple Matching ──────────────────────────────────────────── */

export interface TempleEntry {
  id: string;
  name: string;
  city: string;
  state: string;
  deity: string;
  lat: number;
  lon: number;
  famous: boolean;
}

export interface NearbyTemple extends TempleEntry {
  distanceKm: number;
  source: "overpass" | "static";
}

export interface TempleMatchResult {
  hasLocation: boolean;
  deity: string;
  nearbyTemples: NearbyTemple[];
  fallbackRecommendation: string;
  totalTemplesInArea: number;
}

/* ─── Universal Remedies ──────────────────────────────────────── */

export interface UniversalMantra {
  type: string;
  name: string;
  transliteration: string;
  practice: string;
  level: string;
  source: string;
}

export interface UniversalFoundation {
  title: string;
  description: string;
  mantras: UniversalMantra[];
}

export interface UniversalCategory {
  title: string;
  note: string;
  mantras: UniversalMantra[];
}

export interface UniversalRemedies {
  foundation: UniversalFoundation;
  categories: Record<string, UniversalCategory>;
  general: UniversalCategory;
}

export interface PersonalizedResult {
  afflictions: AfflictionInfo[];
  categories: CategoryResult[];
  totalRemedies: number;
  templeMatches: Record<string, TempleMatchResult>;
  universalRemedies?: UniversalRemedies;
}

/* ─── Reports & Auth ──────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  email: string;
}

export interface SharedReport {
  id: string;
  createdAt: string;
  title?: string;
  chartResult: ChartResult;
  personalizedResult: PersonalizedResult;
}

export interface SavedReportMeta {
  id: string;
  createdAt: string;
  title: string;
}

/* ─── Problem Categories ──────────────────────────────────────── */

export const PROBLEM_CATEGORIES = [
  { id: "health", label: "Health & Well-being" },
  { id: "finance", label: "Finance & Wealth" },
  { id: "career", label: "Career & Profession" },
  { id: "relationships", label: "Relationships & Marriage" },
  { id: "litigation", label: "Litigation & Legal" },
  { id: "mental_peace", label: "Mental Peace & Spiritual" },
] as const;

export type ProblemCategoryId = (typeof PROBLEM_CATEGORIES)[number]["id"];

export interface SubProblem {
  id: string;
  label: string;
}

export const SUB_PROBLEMS: Record<ProblemCategoryId, SubProblem[]> = {
  health: [
    { id: "health_problems", label: "General health issues" },
    { id: "chronic_illness", label: "Chronic illness" },
    { id: "bone_joint_pain", label: "Bone & joint pain" },
    { id: "eye_problems", label: "Eye problems" },
    { id: "headaches_migraine", label: "Headaches / Migraine" },
    { id: "insomnia", label: "Insomnia / Sleep issues" },
  ],
  finance: [
    { id: "financial_loss", label: "Financial losses" },
    { id: "debt_problems", label: "Debt problems" },
    { id: "poverty_lack_of_wealth", label: "Lack of wealth" },
    { id: "lottery_gambling_losses", label: "Gambling / speculative losses" },
    { id: "property_disputes", label: "Property disputes" },
  ],
  career: [
    { id: "career_delay", label: "Career delays" },
    { id: "job_loss", label: "Job loss / unemployment" },
    { id: "business_failure", label: "Business failure" },
    { id: "promotion_blocks", label: "Promotion blocks" },
    { id: "authority_issues", label: "Issues with authority" },
  ],
  relationships: [
    { id: "relationship_problems", label: "Relationship problems" },
    { id: "marriage_delay", label: "Marriage delay" },
    { id: "love_failure", label: "Love failure" },
    { id: "divorce_separation", label: "Divorce / Separation" },
    { id: "family_conflicts", label: "Family conflicts" },
    { id: "parental_issues", label: "Issues with parents" },
    { id: "child_conception", label: "Child conception" },
    { id: "child_behavior", label: "Child behaviour" },
  ],
  litigation: [
    { id: "legal_issues", label: "Legal issues" },
    { id: "property_disputes", label: "Property disputes" },
    { id: "vehicle_accidents", label: "Vehicle accidents" },
  ],
  mental_peace: [
    { id: "mental_health", label: "Mental health / Anxiety" },
    { id: "meditation_difficulty", label: "Meditation difficulty" },
    { id: "negative_energy", label: "Negative energy" },
    { id: "evil_eye_hex", label: "Evil eye / Hex" },
    { id: "spiritual_progress", label: "Spiritual progress blocked" },
    { id: "vastu_issues", label: "Vastu issues" },
  ],
};
