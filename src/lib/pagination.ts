/**
 * Pagination constants shared by the server-rendered fallback and the
 * interactive client component.
 *
 * These deliberately live outside any `'use client'` module. A value imported
 * by a Server Component from a client module arrives as a client reference
 * rather than the value itself, which silently breaks arithmetic.
 */

export const DEFAULT_PER_PAGE = 20;

export const PER_PAGE_OPTIONS = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
];

export const ALLOWED_PER_PAGE: number[] = PER_PAGE_OPTIONS.map((option) => option.value);
