/**
 * Original stylized "shadow fighter" characters rendered as inline SVG —
 * dark silhouette bodies with a colored glowing rim, in the spirit of
 * cinematic silhouette fighting games, but fully original designs.
 *
 * Two fighters:
 *   - crimson: "Crimson Blade"  (red rim, twin blade on the back)
 *   - azure:   "Azure Fist"     (blue rim, glowing power gauntlets)
 */

const CHAR_THEMES = {
  crimson: { glow: "#ff4757", glowSoft: "#ff8a9b", core: "#101014" },
  azure:   { glow: "#3da9ff", glowSoft: "#9fd4ff", core: "#101014" },
};

function buildFighterSVG(charId) {
  const t = CHAR_THEMES[charId] || CHAR_THEMES.crimson;
  const extra = charId === "crimson" ? crimsonExtras(t) : azureExtras(t);

  return `
  <svg class="fighter-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-${charId}" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="body-${charId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${t.core}"/>
        <stop offset="1" stop-color="#000002"/>
      </linearGradient>
    </defs>

    <g filter="url(#glow-${charId})" stroke="${t.glow}" stroke-width="2.4" fill="url(#body-${charId})">
      <!-- back leg -->
      <path d="M95,175 L75,230 L68,270 L86,272 L98,232 L108,185 Z"/>
      <!-- front leg -->
      <path d="M112,178 L128,232 L138,270 L120,273 L104,236 L96,188 Z"/>
      <!-- torso -->
      <path d="M78,95 C76,130 80,160 100,182 C120,160 126,130 124,95 C118,78 84,78 78,95 Z"/>
      <!-- back arm -->
      <path d="M80,105 L52,120 L40,150 L52,158 L68,132 L86,114 Z"/>
      <!-- front arm (forward punch-ready) -->
      <path d="M118,106 L150,112 L168,108 L170,122 L148,130 L116,122 Z"/>
      <!-- head -->
      <circle cx="101" cy="62" r="24"/>
      <!-- neck -->
      <path d="M90,80 L112,80 L110,92 L92,92 Z"/>
    </g>

    <!-- glowing eyes -->
    <circle cx="94" cy="60" r="3.2" fill="${t.glowSoft}"/>
    <circle cx="110" cy="60" r="3.2" fill="${t.glowSoft}"/>

    ${extra}
  </svg>`;
}

function crimsonExtras(t) {
  // Twin blade silhouette on the back + a red cape-like trail.
  return `
    <g stroke="${t.glow}" stroke-width="2" fill="#15070a" opacity="0.95">
      <path d="M48,70 L30,40 L40,120 L58,96 Z"/>
    </g>
    <path d="M40,70 L55,100" stroke="${t.glowSoft}" stroke-width="2" opacity="0.6"/>
  `;
}

function azureExtras(t) {
  // Glowing power gauntlets on both hands.
  return `
    <circle cx="168" cy="112" r="11" fill="#07131d" stroke="${t.glow}" stroke-width="2.4"/>
    <circle cx="168" cy="112" r="4.5" fill="${t.glowSoft}"/>
    <circle cx="42" cy="150" r="9" fill="#07131d" stroke="${t.glow}" stroke-width="2.2"/>
    <circle cx="42" cy="150" r="3.6" fill="${t.glowSoft}"/>
  `;
}

function mountFighter(containerEl, charId) {
  containerEl.innerHTML = buildFighterSVG(charId);
  containerEl.dataset.char = charId;
}

/* ---------------------- VFX helpers ---------------------- */

function spawnHitVfx(vfxLayerEl, xPercent, yPercent, color) {
  const dot = document.createElement("div");
  dot.className = "vfx-hit";
  dot.style.left = xPercent + "%";
  dot.style.top = yPercent + "%";
  if (color) dot.style.background = `radial-gradient(circle, #fff, ${color} 45%, transparent 70%)`;
  vfxLayerEl.appendChild(dot);
  setTimeout(() => dot.remove(), 550);
}

function spawnDamageNumber(vfxLayerEl, xPercent, yPercent, amount) {
  const el = document.createElement("div");
  el.className = "dmg-float";
  el.style.left = xPercent + "%";
  el.style.top = yPercent + "%";
  el.textContent = "-" + amount;
  vfxLayerEl.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}
