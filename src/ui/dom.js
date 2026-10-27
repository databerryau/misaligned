// Tiny DOM helpers: element builder, number formatting, colour variables, icons.

/**
 * h('div', { class: 'x', onClick: fn, style: { '--c': '#fff' } }, child, …)
 * Props: class, text, html, style (object; --vars supported), on* listeners,
 * anything else becomes an attribute (true → empty attribute, false/null skipped).
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sv == null) continue;
        if (sk.startsWith('--')) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
    } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** 1,240 · −120 */
export const fmt = (n) => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('en-US');
/** +300 · −120 · +0 */
export const signed = (n) => (n < 0 ? '−' : '+') + Math.abs(Math.round(n)).toLocaleString('en-US');

/** CSS variables for a colour: --c (hex) and --c-rgb ("r, g, b") for rgba(var(--c-rgb), a). */
export function colorVars(hex, name = 'c') {
  const n = parseInt(hex.slice(1), 16);
  return { [`--${name}`]: hex, [`--${name}-rgb`]: `${n >> 16}, ${(n >> 8) & 255}, ${n & 255}` };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const svg = (body, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  muted: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  menu: svg('<path d="M5 7.5h14M5 12h14M5 16.5h14"/>'),
  close: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  back: svg('<path d="M14.5 6l-6 6 6 6"/>'),
  codex: svg('<path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M5 16.5a3 3 0 0 1 3-3h10.5"/>'),
  caught: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8 12.2l2.8 2.8 5.2-5.6"/>'),
  missed: svg('<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  over: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>'),
  exploited: svg('<circle cx="12" cy="12" r="8.5"/><path d="M9 8.5l5 3.5-5 3.5"/>'),
  blocked: svg('<circle cx="12" cy="12" r="8.5"/><path d="M6.5 17.5l11-11"/>'),
  lock: svg('<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  share: svg('<path d="M12 15V4.5M8 8.5l4-4 4 4"/><path d="M6 12.5v6h12v-6"/>'),
  download: svg('<path d="M12 4.5V15M8 11l4 4 4-4"/><path d="M5.5 19.5h13"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  seats: svg('<rect x="4.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.5"/>'),
  replay: svg('<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4.5V8h3.5"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>'),
  arrow: svg('<path d="M5 12h13M13 7l5 5-5 5"/>'),
};

export function icon(name) {
  return h('span', { class: 'ico', html: ICONS[name] || '' });
}
