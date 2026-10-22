import { TURNSTILE_SITE_KEY } from './config';

/**
 * Cloudflare Turnstile in invisible "execute" mode.
 *
 * The iframe spends backend resources at three points — the itinerary quote
 * (Google Distance Matrix), the card payment (Square), and the booking create —
 * and each needs its OWN token because a Turnstile token is single-use and
 * expires in 5 minutes. So instead of one visible widget, we keep one hidden
 * widget and mint a fresh token on demand right before each of those calls.
 *
 * Mirrors loadGoogleMaps.js: the script is injected lazily, once.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise; // resolves when window.turnstile is ready
let widgetId;      // the single hidden widget
let pending;       // { resolve, reject } for the execute() currently in flight

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    // turnstile can appear a tick after onload, same quirk as the Maps SDK.
    s.onload = () => {
      const deadline = Date.now() + 8000;
      (function wait() {
        if (window.turnstile) return resolve();
        if (Date.now() > deadline) return reject(new Error('turnstile-load-timeout'));
        setTimeout(wait, 50);
      })();
    };
    s.onerror = () => { scriptPromise = null; reject(new Error('turnstile-unreachable')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function ensureWidget() {
  if (widgetId != null) return;
  const host = document.createElement('div');
  // Do NOT display:none — with appearance 'interaction-only' the widget is
  // already invisible until Cloudflare actually needs input, and hiding the
  // host would stop that challenge from ever showing. Park it centered so, on
  // the rare occasion a challenge appears, the visitor can see and solve it.
  host.style.cssText = 'position:fixed;left:50%;top:1rem;transform:translateX(-50%);z-index:2147483647';
  document.body.appendChild(host);
  widgetId = window.turnstile.render(host, {
    sitekey: TURNSTILE_SITE_KEY,
    execution: 'execute',           // don't challenge until execute() is called
    appearance: 'interaction-only', // stay invisible unless Cloudflare needs input
    callback: (token) => { pending?.resolve(token); pending = null; },
    'error-callback': () => { pending?.reject(new Error('turnstile-error')); pending = null; },
    'expired-callback': () => { pending?.reject(new Error('turnstile-expired')); pending = null; },
  });
}

/**
 * A fresh, single-use Turnstile token for ONE action. Resolves '' when no site
 * key is configured (dev / disabled) so callers degrade gracefully — the backend
 * skips verification when its secret is likewise unset.
 *
 * The booking flow calls these one at a time (quote, then later pay/booking), so
 * only one execute() is ever in flight; a second call before the first resolves
 * drops the earlier waiter.
 *
 * @param {string} [action] label sent to Cloudflare ('quote' | 'pay' | 'booking')
 * @returns {Promise<string>}
 */
export async function getTurnstileToken(action) {
  if (!TURNSTILE_SITE_KEY) return '';
  await loadScript();
  ensureWidget();
  // Discard any previous (single-use) token before minting the next one.
  window.turnstile.reset(widgetId);
  return new Promise((resolve, reject) => {
    pending = { resolve, reject };
    try {
      window.turnstile.execute(widgetId, action ? { action } : undefined);
    } catch (err) {
      pending = null;
      reject(err);
    }
  });
}
