/**
 * Vertical switch — one deploy per brand. Set VITE_VERTICAL_ID=bpicius or hazelallure.
 * Never mix branding, copy, or SEO between stacks.
 */
import { HAZELALLURE_VERTICAL } from './verticals/hazelallure';
import { BPICIUS_VERTICAL } from './verticals/bpicius';

const VERTICALS = {
  hazelallure: HAZELALLURE_VERTICAL,
  bpicius: BPICIUS_VERTICAL,
};

const requestedId = (import.meta.env.VITE_VERTICAL_ID || 'hazelallure').toLowerCase().trim();

export const VERTICAL = VERTICALS[requestedId] || HAZELALLURE_VERTICAL;
export const VERTICAL_ID = VERTICAL.id;

export function isBpicius() {
  return VERTICAL.id === 'bpicius';
}

export function isHazelAllure() {
  return VERTICAL.id === 'hazelallure';
}

export function verticalFeature(key) {
  return !!VERTICAL.features?.[key];
}

export function blogUrl(path) {
  return `${VERTICAL.blogBaseUrl}${path}`;
}