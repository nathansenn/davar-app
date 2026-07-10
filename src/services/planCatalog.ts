/**
 * Plan Catalog
 *
 * Reads the bundled reading-plan JSON directly (no SQLite) and exposes plan
 * metadata, per-day schedules, and passage formatting/navigation helpers.
 * Pure and dependency-light so it is fast to unit-test.
 */

import { bookIdToSlug } from '../utils/bookSlug';

/* eslint-disable @typescript-eslint/no-var-requires */
const booksMeta = require('../../assets/metadata/books.json') as {
  books: { id: string; name: string }[];
};
const RAW_PLANS: Record<string, ReadingPlanData> = {
  'bible-1-year': require('../../assets/plans/bible-1-year.json'),
  'new-testament-90': require('../../assets/plans/new-testament-90.json'),
  'psalms-proverbs': require('../../assets/plans/psalms-proverbs.json'),
};
/* eslint-enable @typescript-eslint/no-var-requires */

export interface PlanPassage {
  bookId: string;
  startChapter: number;
  endChapter?: number;
}

export interface PlanDay {
  day: number;
  passages: PlanPassage[];
}

export interface ReadingPlanData {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  schedule: PlanDay[];
}

export interface PlanSummary {
  id: string;
  name: string;
  description: string;
  durationDays: number;
}

const BOOK_NAMES: Record<string, string> = Object.fromEntries(
  booksMeta.books.map((b) => [b.id, b.name])
);

function bookName(bookId: string): string {
  return BOOK_NAMES[bookId] || bookId;
}

/** All available reading plans (metadata only). */
export function getPlans(): PlanSummary[] {
  return Object.values(RAW_PLANS).map(({ id, name, description, durationDays }) => ({
    id,
    name,
    description,
    durationDays,
  }));
}

export function getPlan(planId: string): ReadingPlanData | null {
  return RAW_PLANS[planId] || null;
}

/** The schedule entry for a given 1-indexed day of a plan. */
export function getPlanDay(planId: string, day: number): PlanDay | null {
  const plan = getPlan(planId);
  if (!plan) return null;
  return plan.schedule.find((d) => d.day === day) || null;
}

/** "Genesis 1-3" / "Matthew 1" */
export function formatPassage(p: PlanPassage): string {
  const name = bookName(p.bookId);
  if (p.endChapter && p.endChapter !== p.startChapter) {
    return `${name} ${p.startChapter}-${p.endChapter}`;
  }
  return `${name} ${p.startChapter}`;
}

/** "Genesis 1-3 · Matthew 1 · Psalm 1" */
export function formatPassages(passages: PlanPassage[]): string {
  return passages.map(formatPassage).join(' · ');
}

/** Route to the first passage of a day, e.g. "/read/genesis-1". */
export function passageRoute(p: PlanPassage): string {
  return `/read/${bookIdToSlug(p.bookId)}-${p.startChapter}`;
}

/** Rough estimate of reading time for a day's passages. */
export function estimateMinutes(passages: PlanPassage[]): number {
  const chapters = passages.reduce(
    (sum, p) => sum + ((p.endChapter ?? p.startChapter) - p.startChapter + 1),
    0
  );
  // ~3.5 minutes per chapter, minimum 1
  return Math.max(1, Math.round(chapters * 3.5));
}
