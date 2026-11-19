/**
 * Original stylized "shadow fighter" characters rendered as inline SVG —
 * solid dark silhouette bodies (single filled shape, dynamic lunge pose)
 * with only a thin colored rim-light on the leading edge and a colored
 * weapon/accessory accent, in the spirit of cinematic silhouette fighting
 * games (Shadow Fight-style), but fully original designs.
 *
 * Two fighters:
 *   - crimson: "Crimson Blade"  (red rim, curved blade raised overhead)
 *   - azure:   "Azure Fist"     (blue rim, glowing power gauntlets)
 */

const CHAR_THEMES = {
  crimson: { glow: "#ff4757", glowSoft: "#ffb3bd", glowHot: "#fff2c8", silhouette: "#0a0607" },
  azure:   { glow: "#3da9ff", glowSoft: "#c3e8ff", glowHot: "#f0fbff", silhouette: "#060a0a" },
};

function buildFighterSVG(charId) {
  const t = CHAR_THEMES[charId] || CHAR_THEMES.crimson;
  const extra = charId === "crimson" ? crimsonExtras(t) : azureExtras(t);

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
    <ellipse cx="104" cy="280" rx="58" ry="12" fill="url(#aura-${charId})"/>

    <!-- SOLID SILHOUETTE: one dynamic lunge-forward fighting pose, true
         flat-black cutout (like a shadow), with a faint 1px rim-light on
         the top/leading edge only (drawn as a thin offset outline, not a
         full neon stroke). -->
    <g fill="${t.silhouette}">
      <!-- trailing back leg, bent at the knee, pushing off behind -->
      <path d="M100,172 L72,204 L58,250 L60,274 L78,274 L84,240 L100,206 L110,184 Z"/>
      <!-- driving front leg, knee bent forward, foot planted leading edge -->
      <path d="M108,176 L140,196 L156,236 L152,274 L132,274 L130,242 L112,212 L98,188 Z"/>
      <!-- torso leaning into the lunge -->
      <path d="M86,96 C74,112 70,134 78,156 C82,168 92,178 104,182 C114,172 120,156 118,138 C116,118 128,100 120,88 C110,78 94,82 86,96 Z"/>
      <!-- back arm, cocked high behind the head -->
      <path d="M96,98 C82,86 66,78 50,76 L46,88 C60,92 72,100 84,112 Z"/>
      <!-- front arm, driving forward (weapon/fist attaches at tip) -->
      <path d="M116,96 C134,92 152,88 168,78 L176,90 C160,100 144,108 126,112 Z"/>
      <!-- head, chin tucked, leaning into the charge -->
      <circle cx="98" cy="62" r="21"/>
      <path d="M78,66 C84,78 98,84 112,78 L108,60 C100,66 88,66 82,56 Z"/>
    </g>

    <!-- thin rim-light along the top/leading silhouette edge only -->
    <path d="M86,96 C74,112 70,134 78,156 M96,98 C82,86 66,78 50,76 M78,66 C72,58 70,48 76,40"
      fill="none" stroke="${t.glow}" stroke-width="1.6" opacity="0.85" filter="url(#rimglow-${charId})" stroke-linecap="round"/>
    <circle cx="98" cy="62" r="21" fill="none" stroke="${t.glow}" stroke-width="1.1" opacity="0.5" stroke-dasharray="40 100" filter="url(#rimglow-${charId})"/>

    <!-- faint glowing eye -->
    <circle cx="92" cy="60" r="2.6" fill="${t.glowHot}" filter="url(#softglow-${charId})"/>

    ${extra}
  </svg>`;
}

function crimsonExtras(t) {
  // Curved blade raised in the forward hand, with a glowing edge + motion trail.
  return `
    <g filter="url(#softglow-crimson)">
      <path d="M168,78 C186,64 200,44 198,22 C180,30 164,48 152,70 Z" fill="${t.silhouette}"/>
      <path d="M168,78 C186,64 200,44 198,22" fill="none" stroke="${t.glow}" stroke-width="2" opacity="0.9"/>
    </g>
    <path d="M160,86 C176,72 188,54 192,34" stroke="${t.glowSoft}" stroke-width="1.2" opacity="0.4" fill="none"/>
    <!-- torn cape trailing from the back shoulder -->
    <path d="M60,100 C44,124 40,152 50,178 C58,160 54,132 70,106 Z" fill="${t.silhouette}" opacity="0.92"/>
    <path d="M60,100 C44,124 40,152 50,178" fill="none" stroke="${t.glow}" stroke-width="1" opacity="0.5"/>
  `;
}

function azureExtras(t) {
  // Glowing power gauntlets on both fists + chest energy core.
  return `
    <circle cx="174" cy="86" r="11" fill="${t.silhouette}" filter="url(#softglow-azure)"/>
    <circle cx="174" cy="86" r="11" fill="none" stroke="${t.glow}" stroke-width="1.6" opacity="0.9"/>
    <circle cx="174" cy="86" r="4.4" fill="${t.glowHot}"/>
    <circle cx="48" cy="80" r="9" fill="${t.silhouette}" filter="url(#softglow-azure)"/>
    <circle cx="48" cy="80" r="9" fill="none" stroke="${t.glow}" stroke-width="1.4" opacity="0.8"/>
    <circle cx="48" cy="80" r="3.4" fill="${t.glowHot}"/>
    <!-- chest energy core -->
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
