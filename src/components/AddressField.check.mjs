// Guards the one failure mode this styling has: an unknown CSS custom property
// is ignored in silence, so a plausible-but-wrong token name leaves the field
// wearing Google's default chrome and looks like the fix did nothing at all.
// (--gmp-mat-color-outline and --gmp-mat-color-surface-variant both read fine
// and are both invented; that is how this got shipped wrong the first time.)
//
// Run: node src/components/AddressField.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Published at developers.google.com/maps/documentation/javascript/
// places-ui-kit/custom-styling. Extend only from that page.
const PUBLISHED = new Set([
  '--gmp-mat-color-surface',
  '--gmp-mat-color-on-surface',
  '--gmp-mat-color-on-surface-variant',
  '--gmp-mat-color-primary',
  '--gmp-mat-color-secondary-container',
  '--gmp-mat-color-on-secondary-container',
  '--gmp-mat-color-outline-decorative',
  '--gmp-mat-color-neutral-container',
  '--gmp-mat-color-on-neutral-container',
  '--gmp-mat-font-family',
  '--gmp-mat-font-label-large',
  '--gmp-mat-font-body-medium',
]);

const src = readFileSync(new URL('./AddressField.jsx', import.meta.url), 'utf8');
const used = [...src.matchAll(/'(--gmp-[a-z-]+)'/g)].map((m) => m[1]);

assert.ok(used.length, 'no --gmp-* tokens found — did the styling get dropped?');
for (const token of used) {
  assert.ok(PUBLISHED.has(token), `${token} is not a published Google token — it will be ignored silently`);
}
console.log(`ok — ${new Set(used).size} Google tokens, all published`);
