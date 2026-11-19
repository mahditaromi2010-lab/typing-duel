(() => {
  const socket = io();

  // ---------- DOM refs ----------
  const screens = {
    login: document.getElementById("screen-login"),
    lobby: document.getElementById("screen-lobby"),
    vs: document.getElementById("screen-vs"),
    battle: document.getElementById("screen-battle"),
    gameover: document.getElementById("screen-gameover"),
  };
  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  const nicknameInput = document.getElementById("nickname-input");
  const btnLogin = document.getElementById("btn-login");
  const loginError = document.getElementById("login-error");

  const lobbyNickname = document.getElementById("lobby-nickname");
  const lobbyCoins = document.getElementById("lobby-coins");
  const lobbyError = document.getElementById("lobby-error");
  const btnFindMatch = document.getElementById("btn-find-match");
  const btnCancelFind = document.getElementById("btn-cancel-find");
  const waitingBox = document.getElementById("waiting-box");

  const langRow = document.getElementById("lang-row");
  const difficultyRow = document.getElementById("difficulty-row");
  const betRow = document.getElementById("bet-row");

  const vsCharLeft = document.getElementById("vs-char-left");
  const vsCharRight = document.getElementById("vs-char-right");
  const vsNameLeft = document.getElementById("vs-name-left");
  const vsNameRight = document.getElementById("vs-name-right");
  const vsPot = document.getElementById("vs-pot");

  const hpNameLeft = document.getElementById("hp-name-left");
  const hpNameRight = document.getElementById("hp-name-right");
  const hpBarLeft = document.getElementById("hp-bar-left");
  const hpBarRight = document.getElementById("hp-bar-right");
  const roundNumEl = document.getElementById("round-num");
  const fighterLeft = document.getElementById("fighter-left");
  const fighterRight = document.getElementById("fighter-right");
  const vfxLayer = document.getElementById("vfx-layer");
  const fightersStage = document.querySelector(".fighters-stage");

  const timerBar = document.getElementById("timer-bar");
  const promptText = document.getElementById("prompt-text");
  const typeInput = document.getElementById("type-input");
  const roundMsg = document.getElementById("round-msg");

  const gameoverTitle = document.getElementById("gameover-title");
  const gameoverSub = document.getElementById("gameover-sub");
  const gameoverCoins = document.getElementById("gameover-coins");
  const btnRematch = document.getElementById("btn-rematch");

  // ---------- Local state ----------
  let myNickname = "";
  let myCoins = 0;
  let selected = { lang: "fa", difficulty: "easy", bet: 0 };

  let match = null; // { matchId, me:{nickname,character,hp,maxHp}, opp:{...} }
  let timerAnimFrame = null;

  // ---------- Chip selectors ----------
  function wireChipRow(rowEl, key) {
    rowEl.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        rowEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        selected[key] = isNaN(Number(chip.dataset.value)) || key === "lang" || key === "difficulty"
          ? chip.dataset.value
          : Number(chip.dataset.value);
      });
    });
  }
  wireChipRow(langRow, "lang");
  wireChipRow(difficultyRow, "difficulty");
  wireChipRow(betRow, "bet");

  // ---------- Login ----------
  btnLogin.addEventListener("click", doLogin);
  nicknameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });

  function doLogin() {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
      loginError.textContent = "لطفاً یک نام وارد کن.";
      return;
    }
    socket.emit("login", { nickname }, (res) => {
      if (!res || !res.ok) {
        loginError.textContent = (res && res.error) || "خطا در ورود.";
        return;
      }
      myNickname = nickname;
      myCoins = res.coins;
      lobbyNickname.textContent = myNickname;
      lobbyCoins.textContent = myCoins;
      showScreen("lobby");
    });
  }

  // ---------- Matchmaking ----------
  btnFindMatch.addEventListener("click", () => {
    lobbyError.textContent = "";
    if (selected.bet > myCoins) {
      lobbyError.textContent = "سکه کافی برای این شرط نداری.";
      return;
    }
    socket.emit("find_match", selected);
    waitingBox.classList.remove("hidden");
    btnFindMatch.classList.add("hidden");
  });

  btnCancelFind.addEventListener("click", () => {
    socket.emit("cancel_find");
    waitingBox.classList.add("hidden");
    btnFindMatch.classList.remove("hidden");
  });

  socket.on("waiting_for_opponent", () => {
    waitingBox.classList.remove("hidden");
    btnFindMatch.classList.add("hidden");
  });

  socket.on("match_error", ({ error }) => {
    lobbyError.textContent = error || "خطا در پیدا کردن حریف.";
    waitingBox.classList.add("hidden");
    btnFindMatch.classList.remove("hidden");
  });

  // ---------- Match found ----------
  socket.on("match_found", (data) => {
    waitingBox.classList.add("hidden");
    btnFindMatch.classList.remove("hidden");

    match = {
      matchId: data.matchId,
      me: { ...data.you, maxHp: data.you.character.maxHp },
      opp: { ...data.opponent, maxHp: data.opponent.character.maxHp },
      pot: data.bet * 2,
    };
    myCoins = data.yourCoins;

    vsNameLeft.textContent = match.me.nickname;
    vsNameRight.textContent = match.opp.nickname;
    mountFighter(vsCharLeft, match.me.character.id);
    mountFighter(vsCharRight, match.opp.character.id);
    vsPot.textContent = match.pot;

    showScreen("vs");

    setTimeout(() => {
      hpNameLeft.textContent = `${match.me.nickname} (${match.me.character.name})`;
      hpNameRight.textContent = `${match.opp.nickname} (${match.opp.character.name})`;
      mountFighter(fighterLeft, match.me.character.id);
      mountFighter(fighterRight, match.opp.character.id);
      fighterLeft.classList.remove("hit", "ko");
      fighterRight.classList.remove("hit", "ko");
      setHpBar(hpBarLeft, 100);
      setHpBar(hpBarRight, 100);
      roundMsg.textContent = "";
      showScreen("battle");
    }, 2300);
  });

  function setHpBar(el, pct) {
    el.style.width = Math.max(0, Math.min(100, pct)) + "%";
  }

  // ---------- Rounds ----------
  let currentPrompt = "";
  let roundLocked = false;

  socket.on("round_start", ({ round, prompt, timeLimit }) => {
    currentPrompt = prompt;
    roundLocked = false;
    roundNumEl.textContent = round;
    promptText.textContent = prompt;
    promptText.className = "prompt-text";
    roundMsg.textContent = "";
    typeInput.value = "";
    typeInput.classList.remove("correct-flash");
    typeInput.disabled = false;
    typeInput.focus();
    startTimerBar(timeLimit);
  });

  function startTimerBar(duration) {
    cancelAnimationFrame(timerAnimFrame);
    timerBar.style.transition = "none";
    timerBar.style.width = "100%";
    requestAnimationFrame(() => {
      timerBar.style.transition = `width ${duration}ms linear`;
      timerBar.style.width = "0%";
    });
  }

  typeInput.addEventListener("input", () => {
    if (roundLocked) return;
    const val = typeInput.value;
    if (val === currentPrompt) {
      roundLocked = true;
      typeInput.classList.add("correct-flash");
      typeInput.disabled = true;
      socket.emit("submit_answer", { matchId: match.matchId, text: val });
    } else if (currentPrompt.startsWith(val)) {
      typeInput.style.borderColor = "";
    } else {
      typeInput.style.borderColor = "#ff4757";
    }
  });

  socket.on("round_timeout", () => {
    roundMsg.textContent = "⏱️ زمان تمام شد! هیچکس به‌موقع تایپ نکرد.";
    typeInput.disabled = true;
  });

  socket.on("round_result", ({ winnerSocketId, attackType, damage, defenderSocketId, defenderHp }) => {
    const iAmAttacker = winnerSocketId === socket.id;
    const iAmDefender = defenderSocketId === socket.id;

    const attackerWrap = iAmAttacker ? fighterLeft : fighterRight;
    const defenderWrap = iAmDefender ? fighterLeft : fighterRight;
    const defenderMaxHp = iAmDefender ? match.me.maxHp : match.opp.maxHp;
    const defenderHpBar = iAmDefender ? hpBarLeft : hpBarRight;

    if (iAmDefender) match.me.hp = defenderHp; else match.opp.hp = defenderHp;

    roundMsg.textContent = iAmAttacker
      ? `✅ تو سریع‌تر بودی! ضربه زدی (-${damage})`
      : `💥 حریف سریع‌تر تایپ کرد و به تو ضربه زد (-${damage})`;

    attackerWrap.classList.remove("attack-jab", "attack-roundhouse", "attack-slash", "attack-flamepunch");
    void attackerWrap.offsetWidth;
    attackerWrap.classList.add("attack-" + attackType);

    setTimeout(() => {
      defenderWrap.classList.remove("hit");
      void defenderWrap.offsetWidth;
      defenderWrap.classList.add("hit");
      setHpBar(defenderHpBar, (defenderHp / defenderMaxHp) * 100);

      const rect = fightersStage.getBoundingClientRect();
      const tRect = defenderWrap.getBoundingClientRect();
      const x = ((tRect.left + tRect.width / 2) - rect.left) / rect.width * 100;
      const y = ((tRect.top + tRect.height * 0.35) - rect.top) / rect.height * 100;
      const glowColor = iAmDefender ? "#3da9ff" : "#ff4757";
      spawnHitVfx(vfxLayer, x, y, glowColor);
      spawnDamageNumber(vfxLayer, x, y, damage);
    }, 220);

    setTimeout(() => {
      attackerWrap.classList.remove("attack-jab", "attack-roundhouse", "attack-slash", "attack-flamepunch");
    }, 650);

    if (defenderHp <= 0) {
      setTimeout(() => defenderWrap.classList.add("ko"), 300);
    }
  });

  // ---------- Game over ----------
  socket.on("match_over", ({ winnerNickname, reason, pot, finalCoins }) => {
    const iWon = winnerNickname === myNickname;
    gameoverTitle.textContent = iWon ? "🏆 تو برنده شدی!" : "💀 شکست خوردی";
    gameoverTitle.className = "gameover-title " + (iWon ? "win" : "lose");

    if (reason === "opponent_disconnected" && iWon) {
      gameoverSub.textContent = "حریف از بازی خارج شد.";
    } else if (reason === "ko") {
      gameoverSub.textContent = iWon ? "حریف را ناک‌اوت کردی!" : "شخصیت تو ناک‌اوت شد.";
    } else {
      gameoverSub.textContent = "";
    }

    if (finalCoins && finalCoins[myNickname] !== undefined) {
      myCoins = finalCoins[myNickname];
    }
    gameoverCoins.textContent = myCoins;
    lobbyCoins.textContent = myCoins;

    setTimeout(() => showScreen("gameover"), 900);
  });

  btnRematch.addEventListener("click", () => {
    match = null;
    roundMsg.textContent = "";
    showScreen("lobby");
  });

  socket.on("disconnect", () => {
    if (screens.battle.classList.contains("active") || screens.vs.classList.contains("active")) {
      roundMsg.textContent = "⚠️ اتصال قطع شد.";
    }
  });
})();
