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
  crimson: { glow: "#ff4757", glowSoft: "#ffb3bd", glowHot: "#fff2c8", core: "#15060a", rim: "#3a0d16" },
  azure:   { glow: "#3da9ff", glowSoft: "#c3e8ff", glowHot: "#f0fbff", core: "#061018", rim: "#0d2c3a" },
};

function buildFighterSVG(charId) {
  const t = CHAR_THEMES[charId] || CHAR_THEMES.crimson;
  const extra = charId === "crimson" ? crimsonExtras(t) : azureExtras(t);

  return `
  <svg class="fighter-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-${charId}" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="4.5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="softglow-${charId}" x="-120%" y="-120%" width="340%" height="340%">
        <feGaussianBlur stdDeviation="7" result="blur2"/>
        <feMerge><feMergeNode in="blur2"/></feMerge>
      </filter>
      <!-- body: dark core with a subtle rim-lit edge toward the top-left -->
      <linearGradient id="body-${charId}" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" stop-color="${t.rim}"/>
        <stop offset="0.35" stop-color="${t.core}"/>
        <stop offset="1" stop-color="#000001"/>
      </linearGradient>
      <radialGradient id="aura-${charId}" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${t.glow}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="muscle-${charId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${t.glowSoft}" stop-opacity="0.22"/>
        <stop offset="1" stop-color="${t.glowSoft}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- ground power aura -->
    <ellipse cx="102" cy="278" rx="60" ry="14" fill="url(#aura-${charId})"/>

    <g filter="url(#glow-${charId})" stroke="${t.glow}" stroke-width="2.6" stroke-linejoin="round" fill="url(#body-${charId})">
      <!-- back leg (calf + boot) -->
      <path d="M93,172 L72,222 L64,266 L74,273 L92,274 L100,230 L110,182 Z"/>
      <path d="M66,262 L84,264 L82,274 L62,274 Z" opacity="0.9"/>
      <!-- front leg (calf + boot), slightly forward stance -->
      <path d="M114,176 L132,224 L144,266 L128,274 L108,274 L98,236 L98,186 Z"/>
      <path d="M126,264 L146,264 L148,274 L124,274 Z" opacity="0.9"/>
      <!-- hips/waist taper -->
      <path d="M82,160 C80,172 84,182 100,188 C116,182 122,172 120,160 Z"/>
      <!-- torso: broader shoulders, tapered waist (fighter build) -->
      <path d="M70,92 C66,118 70,145 84,168 C92,178 110,178 118,168 C132,145 136,118 132,92 C126,72 76,72 70,92 Z"/>
      <!-- chest plate highlight line -->
      <path d="M90,100 C96,120 106,120 112,100" fill="none" stroke="${t.glowSoft}" stroke-width="1.4" opacity="0.5"/>
      <!-- back arm, bent and guarding -->
      <path d="M74,100 L46,110 L34,138 L44,150 L62,128 L82,108 Z"/>
      <!-- front arm, cocked forward (ready to punch) -->
      <path d="M120,98 L152,100 L172,92 L176,106 L156,118 L122,116 Z"/>
      <!-- shoulder pads -->
      <circle cx="72" cy="96" r="13"/>
      <circle cx="130" cy="94" r="13"/>
      <!-- head -->
      <circle cx="101" cy="58" r="23"/>
      <!-- jaw/mask line -->
      <path d="M84,64 C92,76 110,76 118,64" fill="none" stroke="${t.glow}" stroke-width="1.6" opacity="0.7"/>
      <!-- neck -->
      <path d="M90,76 L112,76 L109,90 L93,90 Z"/>
    </g>

    <!-- subtle top-left muscle sheen -->
    <path d="M74,96 C71,118 75,142 86,163 C90,150 88,120 90,96 Z" fill="url(#muscle-${charId})"/>

    <!-- glowing eyes -->
    <circle cx="93" cy="56" r="3.4" fill="${t.glowHot}"/>
    <circle cx="111" cy="56" r="3.4" fill="${t.glowHot}"/>
    <circle cx="93" cy="56" r="6" fill="${t.glow}" opacity="0.35" filter="url(#softglow-${charId})"/>
    <circle cx="111" cy="56" r="6" fill="${t.glow}" opacity="0.35" filter="url(#softglow-${charId})"/>

    ${extra}
  </svg>`;
}

function crimsonExtras(t) {
  // Twin curved blades on the back, a torn cape trail, and glowing knuckle wraps.
  return `
    <g stroke="${t.glow}" stroke-width="2.2" fill="#1c070b" opacity="0.95" filter="url(#softglow-crimson)">
      <path d="M50,66 C34,50 24,28 30,8 C44,18 54,36 56,60 Z"/>
      <path d="M44,78 C24,70 10,52 10,30 C26,36 40,52 48,72 Z"/>
    </g>
    <path d="M38,64 L54,98" stroke="${t.glowSoft}" stroke-width="2" opacity="0.55"/>
    <path d="M30,52 L50,88" stroke="${t.glowSoft}" stroke-width="1.4" opacity="0.4"/>
    <!-- torn cape -->
    <path d="M68,88 C54,110 50,140 58,168 C66,150 60,120 76,96 Z" fill="#1c070b" stroke="${t.glow}" stroke-width="1.6" opacity="0.8"/>
    <!-- glowing knuckle wrap on the forward fist -->
    <circle cx="170" cy="100" r="8" fill="#1c070b" stroke="${t.glow}" stroke-width="2.2"/>
    <circle cx="170" cy="100" r="3.2" fill="${t.glowHot}"/>
  `;
}

function azureExtras(t) {
  // Glowing power gauntlets on both hands + chest core + shoulder circuitry.
  return `
    <circle cx="174" cy="104" r="12" fill="#06141d" stroke="${t.glow}" stroke-width="2.6"/>
    <circle cx="174" cy="104" r="5" fill="${t.glowHot}"/>
    <circle cx="174" cy="104" r="9" fill="${t.glow}" opacity="0.4" filter="url(#softglow-azure)"/>
    <circle cx="38" cy="142" r="9.5" fill="#06141d" stroke="${t.glow}" stroke-width="2.2"/>
    <circle cx="38" cy="142" r="3.8" fill="${t.glowHot}"/>
    <!-- chest energy core -->
    <circle cx="101" cy="122" r="7" fill="#06141d" stroke="${t.glow}" stroke-width="2"/>
    <circle cx="101" cy="122" r="3" fill="${t.glowHot}"/>
    <!-- circuitry lines down the forearm -->
    <path d="M126,100 L150,98 M134,106 L158,104" stroke="${t.glowSoft}" stroke-width="1.3" opacity="0.6"/>
    <!-- shoulder vents -->
    <path d="M62,90 L82,96 M60,98 L80,104" stroke="${t.glowSoft}" stroke-width="1.3" opacity="0.5"/>
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

  // Impact shock ring
  const ring = document.createElement("div");
  ring.className = "vfx-ring";
  ring.style.left = xPercent + "%";
  ring.style.top = yPercent + "%";
  if (color) ring.style.borderColor = color;
  vfxLayerEl.appendChild(ring);
  setTimeout(() => ring.remove(), 450);

  // Spark shard burst
  const shardCount = 7;
  for (let i = 0; i < shardCount; i++) {
    const shard = document.createElement("div");
    shard.className = "vfx-shard";
    shard.style.left = xPercent + "%";
    shard.style.top = yPercent + "%";
    if (color) shard.style.background = color;
    const angle = (360 / shardCount) * i + (Math.random() * 24 - 12);
    const dist = 26 + Math.random() * 30;
    shard.style.setProperty("--ang", angle + "deg");
    shard.style.setProperty("--dist", dist + "px");
    vfxLayerEl.appendChild(shard);
    setTimeout(() => shard.remove(), 500);
  }
}

function shakeStage(stageEl) {
  if (!stageEl) return;
  stageEl.classList.remove("stage-shake");
  void stageEl.offsetWidth;
  stageEl.classList.add("stage-shake");
  setTimeout(() => stageEl.classList.remove("stage-shake"), 350);
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
