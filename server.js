/**
 * Typing Duel — real-time 2-player online typing battle game.
 *
 * - Express serves the static client.
 * - Socket.io handles matchmaking, rounds and the coin-betting economy.
 * - A tiny JSON file is used as a persistence layer for each player's coins
 *   (nickname-based, no real auth — good enough for a casual game; swap in
 *   a real database + auth if you plan to ship this for real).
 */

const path = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WORD_LISTS = require("./public/wordlists.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Persistence (very small JSON "database" keyed by nickname)
// ---------------------------------------------------------------------------
const DB_PATH = path.join(__dirname, "data", "users.json");
const STARTING_COINS = 500;

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
}
function saveUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}
let users = loadUsers();

function getOrCreateUser(nickname) {
  if (!users[nickname]) {
    users[nickname] = { coins: STARTING_COINS, wins: 0, losses: 0 };
    saveUsers(users);
  }
  return users[nickname];
}

// ---------------------------------------------------------------------------
// Characters — two original fighters (random one assigned to each player).
// ---------------------------------------------------------------------------
const CHARACTERS = {
  crimson: { id: "crimson", name: "Crimson Blade", maxHp: 110, dmgMultiplier: 0.9 },
  azure: { id: "azure", name: "Azure Fist", maxHp: 95, dmgMultiplier: 1.1 },
};

const ATTACKS = ["jab", "roundhouse", "slash", "flamepunch"];

// ---------------------------------------------------------------------------
// Difficulty configuration
// ---------------------------------------------------------------------------
const DIFFICULTIES = {
  easy: { timeLimit: 9000, dmgMin: 8, dmgMax: 14, pool: "easy" },
  medium: { timeLimit: 7000, dmgMin: 10, dmgMax: 18, pool: "medium" },
  hard: { timeLimit: 6000, dmgMin: 14, dmgMax: 24, pool: "hard" },
};

function randomPrompt(lang, pool, recentSet) {
  const list = WORD_LISTS[lang][pool];
  let idx;
  let tries = 0;
  do {
    idx = Math.floor(Math.random() * list.length);
    tries++;
  } while (recentSet.has(idx) && tries < 10 && list.length > 3);
  recentSet.add(idx);
  if (recentSet.size > Math.max(3, Math.floor(list.length / 2))) {
    recentSet.clear();
  }
  return list[idx];
}

// ---------------------------------------------------------------------------
// Matchmaking queues: key = `${lang}_${difficulty}_${bet}`
// ---------------------------------------------------------------------------
const queues = new Map(); // key -> [{ socketId, nickname }]
const matches = new Map(); // matchId -> match state
let matchCounter = 1;

function queueKey(lang, difficulty, bet) {
  return `${lang}_${difficulty}_${bet}`;
}

function removeFromAllQueues(socketId) {
  for (const [key, arr] of queues.entries()) {
    const filtered = arr.filter((p) => p.socketId !== socketId);
    if (filtered.length) queues.set(key, filtered);
    else queues.delete(key);
  }
}

function startMatch(playerA, playerB, lang, difficulty, bet) {
  const matchId = `m${matchCounter++}`;
  const charIds = Object.keys(CHARACTERS);
  // Randomly assign the two distinct characters to the two players.
  const shuffled = Math.random() < 0.5 ? charIds : [...charIds].reverse();

  const pA = {
    socketId: playerA.socketId,
    nickname: playerA.nickname,
    character: CHARACTERS[shuffled[0]],
    hp: CHARACTERS[shuffled[0]].maxHp,
  };
  const pB = {
    socketId: playerB.socketId,
    nickname: playerB.nickname,
    character: CHARACTERS[shuffled[1]],
    hp: CHARACTERS[shuffled[1]].maxHp,
  };

  // Deduct the bet from both wallets up-front (held in the pot).
  users[pA.nickname].coins -= bet;
  users[pB.nickname].coins -= bet;
  saveUsers(users);

  const match = {
    id: matchId,
    lang,
    difficulty,
    bet,
    pot: bet * 2,
    players: [pA, pB],
    round: 0,
    recentPromptIdx: new Set(),
    roundAnswered: false,
    currentPrompt: null,
    roundTimer: null,
  };
  matches.set(matchId, match);

  for (const p of match.players) {
    const opponent = match.players.find((x) => x.socketId !== p.socketId);
    io.to(p.socketId).emit("match_found", {
      matchId,
      difficulty,
      lang,
      bet,
      you: { nickname: p.nickname, character: p.character, hp: p.hp },
      opponent: { nickname: opponent.nickname, character: opponent.character, hp: opponent.hp },
      yourCoins: users[p.nickname].coins,
    });
    const sock = io.sockets.sockets.get(p.socketId);
    if (sock) sock.join(matchId);
  }

  setTimeout(() => nextRound(matchId), 2600); // small intro/vs delay
}

function nextRound(matchId) {
  const match = matches.get(matchId);
  if (!match) return;
  match.round += 1;
  match.roundAnswered = false;

  const cfg = DIFFICULTIES[match.difficulty];
  const prompt = randomPrompt(match.lang, cfg.pool, match.recentPromptIdx);
  match.currentPrompt = prompt;
  match.promptStartedAt = Date.now();

  io.to(matchId).emit("round_start", {
    round: match.round,
    prompt,
    timeLimit: cfg.timeLimit,
  });

  clearTimeout(match.roundTimer);
  match.roundTimer = setTimeout(() => {
    if (!match.roundAnswered) {
      io.to(matchId).emit("round_timeout", { round: match.round });
      setTimeout(() => nextRound(matchId), 1200);
    }
  }, cfg.timeLimit + 300);
}

function endMatch(matchId, winnerSocketId, reason) {
  const match = matches.get(matchId);
  if (!match) return;
  clearTimeout(match.roundTimer);

  const winner = match.players.find((p) => p.socketId === winnerSocketId);
  const loser = match.players.find((p) => p.socketId !== winnerSocketId);

  if (winner) {
    users[winner.nickname].coins += match.pot;
    users[winner.nickname].wins += 1;
  }
  if (loser) {
    users[loser.nickname].losses += 1;
  }
  saveUsers(users);

  io.to(matchId).emit("match_over", {
    winnerNickname: winner ? winner.nickname : null,
    reason,
    pot: match.pot,
    finalCoins: {
      [winner ? winner.nickname : ""]: winner ? users[winner.nickname].coins : undefined,
      [loser ? loser.nickname : ""]: loser ? users[loser.nickname].coins : undefined,
    },
  });

  matches.delete(matchId);
}

// ---------------------------------------------------------------------------
// Socket handlers
// ---------------------------------------------------------------------------
io.on("connection", (socket) => {
  socket.data.nickname = null;
  socket.data.matchId = null;

  socket.on("login", ({ nickname }, cb) => {
    nickname = String(nickname || "").trim().slice(0, 20);
    if (!nickname) {
      cb && cb({ ok: false, error: "نام کاربری نامعتبر است." });
      return;
    }
    socket.data.nickname = nickname;
    const user = getOrCreateUser(nickname);
    cb && cb({ ok: true, coins: user.coins, wins: user.wins, losses: user.losses });
  });

  socket.on("find_match", ({ difficulty, bet, lang }) => {
    const nickname = socket.data.nickname;
    if (!nickname) return;
    if (!DIFFICULTIES[difficulty]) return;
    lang = lang === "en" ? "en" : "fa";
    bet = Math.max(0, Math.min(10000, parseInt(bet, 10) || 0));

    const user = getOrCreateUser(nickname);
    if (user.coins < bet) {
      socket.emit("match_error", { error: "سکه کافی نداری." });
      return;
    }

    const key = queueKey(lang, difficulty, bet);
    const waiting = queues.get(key) || [];

    // Don't match with yourself (e.g. double click).
    const opponentEntry = waiting.find((p) => p.socketId !== socket.id);

    if (opponentEntry) {
      queues.set(key, waiting.filter((p) => p.socketId !== opponentEntry.socketId));
      startMatch({ socketId: socket.id, nickname }, opponentEntry, lang, difficulty, bet);
    } else {
      removeFromAllQueues(socket.id);
      queues.set(key, [...waiting, { socketId: socket.id, nickname }]);
      socket.emit("waiting_for_opponent");
    }
  });

  socket.on("cancel_find", () => {
    removeFromAllQueues(socket.id);
  });

  socket.on("submit_answer", ({ matchId, text }) => {
    const match = matches.get(matchId);
    if (!match || match.roundAnswered) return;
    if (typeof text !== "string" || text.trim() !== String(match.currentPrompt).trim()) return;

    const attacker = match.players.find((p) => p.socketId === socket.id);
    const defender = match.players.find((p) => p.socketId !== socket.id);
    if (!attacker || !defender) return;

    match.roundAnswered = true;
    clearTimeout(match.roundTimer);

    const cfg = DIFFICULTIES[match.difficulty];
    const baseDmg = cfg.dmgMin + Math.random() * (cfg.dmgMax - cfg.dmgMin);
    const dmg = Math.round(baseDmg * attacker.character.dmgMultiplier);
    defender.hp = Math.max(0, defender.hp - dmg);
    const attackType = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];

    io.to(matchId).emit("round_result", {
      round: match.round,
      winnerSocketId: attacker.socketId,
      attackType,
      damage: dmg,
      defenderSocketId: defender.socketId,
      defenderHp: defender.hp,
    });

    if (defender.hp <= 0) {
      setTimeout(() => endMatch(matchId, attacker.socketId, "ko"), 1600);
    } else {
      setTimeout(() => nextRound(matchId), 1700);
    }
  });

  socket.on("disconnect", () => {
    removeFromAllQueues(socket.id);
    for (const [matchId, match] of matches.entries()) {
      const stillHere = match.players.find((p) => p.socketId === socket.id);
      if (!stillHere) continue;
      const opponent = match.players.find((p) => p.socketId !== socket.id);
      if (opponent) {
        endMatch(matchId, opponent.socketId, "opponent_disconnected");
      } else {
        matches.delete(matchId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Typing Duel server running on http://localhost:${PORT}`);
});
