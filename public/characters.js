/**
 * Original stylized "shadow fighter" characters rendered as inline SVG —
 * solid dark silhouette bodies in the spirit of cinematic silhouette
 * fighting games (Shadow Fight-style), but fully original designs.
 *
 * The body is built from separate articulated groups (front arm, front
 * leg, static torso/head/back-limbs) so attacks actually swing a limb
 * toward the opponent — a thrown jab, a swung blade, a kicked leg —
 * instead of just nudging the whole sprite sideways.
 *
 * Two fighters:
 *   - crimson: "Crimson Blade"  (red rim, curved blade in the lead hand)
 *   - azure:   "Azure Fist"     (blue rim, glowing power gauntlets)
 */

const CHAR_THEMES = {
  crimson: { glow: "#ff4757", glowSoft: "#ffb3bd", glowHot: "#fff2c8", silhouette: "#0a0607" },
  azure:   { glow: "#3da9ff", glowSoft: "#c3e8ff", glowHot: "#f0fbff", silhouette: "#060a0a" },
};

function buildFighterSVG(charId) {
  const t = CHAR_THEMES[charId] || CHAR_THEMES.crimson;
  const armExtra = charId === "crimson" ? crimsonArmExtra(t) : azureArmExtra(t);
  const bodyExtra = charId === "crimson" ? crimsonBodyExtra(t) : azureBodyExtra(t);

  return `
  <svg class="fighter-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="rimglow-${charId}" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="softglow-${charId}" x="-140%" y="-140%" width="380%" height="380%">
        <feGaussianBlur stdDeviation="6" result="blur2"/>
        <feMerge><feMergeNode in="blur2"/></feMerge>
      </filter>
      <radialGradient id="aura-${charId}" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${t.glow}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- ground power aura -->
    <ellipse cx="100" cy="282" rx="56" ry="11" fill="url(#aura-${charId})"/>

    <!-- STATIC BODY: back leg, torso, back arm, head (upright guard stance) -->
    <g class="body-grp" fill="${t.silhouette}">
      <path d="M90,180 L62,206 L48,248 L50,276 L72,276 L80,240 L88,208 Z"/>
      <path d="M82,98 C72,112 68,134 76,156 C80,168 90,178 102,182 C112,172 118,156 116,138 C114,118 124,100 116,90 C106,80 90,84 82,98 Z"/>
      <path d="M84,96 C74,86 64,80 54,80 L52,92 C62,94 70,100 78,110 Z"/>
      <circle cx="98" cy="62" r="20"/>
      <path d="M79,66 C85,77 98,83 111,77 L107,60 C100,65 89,65 83,56 Z"/>
    </g>

    <!-- FRONT LEG: pivots at the hip (108,178) — swings for the roundhouse kick -->
    <g class="front-leg-grp" fill="${t.silhouette}">
      <path d="M108,178 L134,198 L146,236 L142,276 L122,276 L120,244 L110,212 L104,188 Z"/>
    </g>

    <!-- FRONT ARM: pivots at the shoulder (114,98) — throws the jab/slash/flamepunch -->
    <g class="front-arm-grp" fill="${t.silhouette}">
      <path d="M114,98 C124,88 132,74 132,52 L118,48 C118,66 112,80 100,92 Z"/>
      ${armExtra}
    </g>

    <!-- thin rim-light along the static silhouette edges only -->
    <path d="M82,98 C72,112 68,134 76,156 M84,96 C74,86 64,80 54,80 M79,66 C73,58 71,48 77,40"
      fill="none" stroke="${t.glow}" stroke-width="1.6" opacity="0.85" filter="url(#rimglow-${charId})" stroke-linecap="round"/>
    <circle cx="98" cy="62" r="20" fill="none" stroke="${t.glow}" stroke-width="1.1" opacity="0.5" stroke-dasharray="38 100" filter="url(#rimglow-${charId})"/>

    <!-- faint glowing eye -->
    <circle cx="92" cy="60" r="2.5" fill="${t.glowHot}" filter="url(#softglow-${charId})"/>

    ${bodyExtra}
  </svg>`;
}

function crimsonArmExtra(t) {
  // Curved blade held in the lead hand — rides the front-arm group, so it
  // swings and slashes together with the arm.
  return `
    <g filter="url(#softglow-crimson)">
      <path d="M130,50 C142,36 154,18 152,0 C136,8 122,24 112,42 Z" fill="${t.silhouette}"/>
      <path d="M130,50 C142,36 154,18 152,0" fill="none" stroke="${t.glow}" stroke-width="2" opacity="0.9"/>
    </g>
    <path d="M122,58 C134,46 144,30 148,14" stroke="${t.glowSoft}" stroke-width="1.1" opacity="0.4" fill="none"/>
  `;
}

function crimsonBodyExtra(t) {
  // Torn cape trailing from the back shoulder — stays with the static body.
  return `
    <path d="M58,98 C42,122 38,150 48,176 C56,158 52,130 68,104 Z" fill="${t.silhouette}" opacity="0.92"/>
    <path d="M58,98 C42,122 38,150 48,176" fill="none" stroke="${t.glow}" stroke-width="1" opacity="0.5"/>
  `;
}

function azureArmExtra(t) {
  // Glowing power gauntlet on the lead fist — rides the front-arm group.
  return `
    <circle cx="130" cy="50" r="11" fill="${t.silhouette}" filter="url(#softglow-azure)"/>
    <circle cx="130" cy="50" r="11" fill="none" stroke="${t.glow}" stroke-width="1.6" opacity="0.9"/>
    <circle cx="130" cy="50" r="4.2" fill="${t.glowHot}"/>
  `;
}

function azureBodyExtra(t) {
  // Back gauntlet + chest energy core — stay with the static body.
  return `
    <circle cx="54" cy="80" r="9" fill="${t.silhouette}" filter="url(#softglow-azure)"/>
    <circle cx="54" cy="80" r="9" fill="none" stroke="${t.glow}" stroke-width="1.4" opacity="0.8"/>
    <circle cx="54" cy="80" r="3.4" fill="${t.glowHot}"/>
    <circle cx="98" cy="128" r="6" fill="${t.silhouette}" filter="url(#softglow-azure)"/>
    <circle cx="98" cy="128" r="6" fill="none" stroke="${t.glow}" stroke-width="1.3" opacity="0.8"/>
    <circle cx="98" cy="128" r="2.4" fill="${t.glowHot}"/>
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
