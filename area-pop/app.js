const boardEl = document.querySelector("#board");
const timeLabel = document.querySelector("#timeLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const comboLabel = document.querySelector("#comboLabel");
const bestLabel = document.querySelector("#bestLabel");
const chainFill = document.querySelector("#chainFill");
const timeFill = document.querySelector("#timeFill");
const toastEl = document.querySelector("#toast");
const overlayEl = document.querySelector("#overlay");
const finalScoreEl = document.querySelector("#finalScore");
const newButton = document.querySelector("#newButton");
const soundButton = document.querySelector("#soundButton");
const againButton = document.querySelector("#againButton");

const gameConfig = {
  rows: 10,
  cols: 14,
  maxArea: 4,
  extraSplit: 0.72,
  time: 60,
  chainWindow: 2500,
  targetMoves: 72,
  sameValueLineGap: 2,
};

const boardCandidateCount = 18;
const missScorePenalty = 5;
const missTimePenalty = 0.75;

const fruitColors = [
  "#f45d5d",
  "#f58b4c",
  "#efb84f",
  "#42b883",
  "#2ca6a4",
  "#d85f8f",
  "#7d6ad8",
];

const state = {
  rows: gameConfig.rows,
  cols: gameConfig.cols,
  cells: [],
  score: 0,
  best: Number(localStorage.getItem("area-pop-best") || 0),
  timeLeft: gameConfig.time,
  combo: 0,
  chainUntil: 0,
  selecting: false,
  hasDragged: false,
  activePointerId: null,
  start: null,
  end: null,
  selectionStatus: "neutral",
  bursts: [],
  running: true,
  endTimer: null,
  lastTick: performance.now(),
  toastUntil: 0,
  boardGeometry: null,
  selectionRenderFrame: null,
  lastWarningSecond: null,
};

const audioState = {
  context: null,
  master: null,
  music: null,
  sfx: null,
  bgmTimer: null,
  bgmStep: 0,
  started: false,
  enabled: localStorage.getItem("area-pop-sound") !== "off",
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function idx(x, y) {
  return y * state.cols + x;
}

function xy(index) {
  return { x: index % state.cols, y: Math.floor(index / state.cols) };
}

function refreshBoardGeometry() {
  const rect = boardEl.getBoundingClientRect();
  const style = getComputedStyle(boardEl);
  const gap = Number.parseFloat(style.gap) || 0;
  const padLeft = Number.parseFloat(style.paddingLeft) || 0;
  const padTop = Number.parseFloat(style.paddingTop) || 0;
  const padRight = Number.parseFloat(style.paddingRight) || 0;
  const padBottom = Number.parseFloat(style.paddingBottom) || 0;
  const innerW = rect.width - padLeft - padRight;
  const innerH = rect.height - padTop - padBottom;

  state.boardGeometry = {
    rect,
    gap,
    padLeft,
    padTop,
    padRight,
    padBottom,
    cellW: (innerW - gap * (state.cols - 1)) / state.cols,
    cellH: (innerH - gap * (state.rows - 1)) / state.rows,
  };
}

function invalidateBoardGeometry() {
  state.boardGeometry = null;
}

function cancelSelectionRender() {
  if (state.selectionRenderFrame === null) return;
  cancelAnimationFrame(state.selectionRenderFrame);
  state.selectionRenderFrame = null;
}

function scheduleSelectionRender() {
  if (state.selectionRenderFrame !== null) return;
  state.selectionRenderFrame = requestAnimationFrame(() => {
    state.selectionRenderFrame = null;
    render();
  });
}

function setupAudio() {
  if (audioState.context) return true;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  const context = new AudioContextClass();
  const master = context.createGain();
  const music = context.createGain();
  const sfx = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.value = audioState.enabled ? 0.72 : 0;
  music.gain.value = 0.16;
  sfx.gain.value = 0.36;

  music.connect(master);
  sfx.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  audioState.context = context;
  audioState.master = master;
  audioState.music = music;
  audioState.sfx = sfx;
  return true;
}

function playTone(frequency, startTime, duration, options = {}) {
  if (!audioState.context || !audioState.enabled) return;

  const {
    type = "sine",
    gain = 0.12,
    destination = audioState.sfx,
    attack = 0.008,
    release = 0.05,
    detune = 0,
  } = options;
  const context = audioState.context;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.detune.setValueAtTime(detune, startTime);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(gain, startTime + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, Math.max(startTime + attack, endTime - release));

  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.02);
}

function playSweep(fromFrequency, toFrequency, duration, options = {}) {
  if (!audioState.context || !audioState.enabled) return;

  const {
    type = "sine",
    gain = 0.12,
    destination = audioState.sfx,
    attack = 0.006,
    release = 0.05,
  } = options;
  const context = audioState.context;
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(fromFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, now + duration);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(gain, now + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration - release);

  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playNoise(duration, gain = 0.08, frequency = 1300) {
  if (!audioState.context || !audioState.enabled) return;

  const context = audioState.context;
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const now = context.currentTime;

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency, now);
  filter.Q.value = 7;
  envelope.gain.setValueAtTime(gain, now);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(audioState.sfx);
  source.start(now);
}

function scheduleBgmPhrase() {
  if (!audioState.context || !audioState.enabled || !state.running) return;

  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  const context = audioState.context;
  const start = context.currentTime + 0.04;

  for (let i = 0; i < 8; i += 1) {
    const note = notes[(audioState.bgmStep + i) % notes.length];
    const time = start + i * 0.18;
    playTone(note, time, 0.13, {
      type: "triangle",
      gain: 0.026,
      destination: audioState.music,
      attack: 0.015,
      release: 0.06,
    });

    if (i % 4 === 0) {
      playTone(note / 2, time, 0.28, {
        type: "sine",
        gain: 0.018,
        destination: audioState.music,
        attack: 0.025,
        release: 0.1,
      });
    }
  }

  audioState.bgmStep = (audioState.bgmStep + 8) % notes.length;
}

function startBgm() {
  if (!audioState.context || !audioState.enabled || audioState.bgmTimer !== null) return;
  scheduleBgmPhrase();
  audioState.bgmTimer = setInterval(scheduleBgmPhrase, 1440);
}

function stopBgm() {
  if (audioState.bgmTimer === null) return;
  clearInterval(audioState.bgmTimer);
  audioState.bgmTimer = null;
}

async function ensureAudio() {
  if (!audioState.enabled || !setupAudio()) return false;
  audioState.started = true;
  if (audioState.context.state === "suspended") {
    await audioState.context.resume();
  }
  if (state.running) startBgm();
  return true;
}

function updateSoundButton() {
  soundButton.setAttribute("aria-pressed", audioState.enabled ? "true" : "false");
  soundButton.setAttribute("aria-label", audioState.enabled ? "Mute sound" : "Unmute sound");
}

function setSoundEnabled(enabled) {
  audioState.enabled = enabled;
  localStorage.setItem("area-pop-sound", enabled ? "on" : "off");
  updateSoundButton();

  if (!audioState.context) return;
  audioState.master.gain.setTargetAtTime(enabled ? 0.72 : 0, audioState.context.currentTime, 0.03);
  if (enabled && audioState.started && state.running) {
    ensureAudio();
  } else if (!enabled) {
    stopBgm();
  }
}

function playSuccessSound(area, combo) {
  if (!audioState.context || !audioState.enabled) return;

  const now = audioState.context.currentTime;
  const base = 420 + area * 38 + Math.min(combo, 10) * 18;
  playNoise(0.055, 0.052, 1500 + area * 120);
  playTone(base, now, 0.09, { type: "triangle", gain: 0.13 });
  playTone(base * 1.5, now + 0.045, 0.11, { type: "sine", gain: 0.09 });
  if (combo > 2) {
    playTone(base * 2, now + 0.095, 0.12, { type: "triangle", gain: 0.055 });
  }
}

function playMissSound() {
  playSweep(190, 105, 0.16, { type: "sawtooth", gain: 0.08, release: 0.04 });
}

function playResetSound() {
  if (!audioState.context || !audioState.enabled) return;
  const now = audioState.context.currentTime;
  playTone(392, now, 0.08, { type: "triangle", gain: 0.07 });
  playTone(523.25, now + 0.07, 0.1, { type: "triangle", gain: 0.08 });
}

function playWarningSound(second) {
  if (!audioState.context || !audioState.enabled) return;
  const frequency = second <= 3 ? 920 : 760;
  playTone(frequency, audioState.context.currentTime, 0.055, {
    type: "square",
    gain: second <= 3 ? 0.055 : 0.035,
    release: 0.02,
  });
}

function playEndSound() {
  if (!audioState.context || !audioState.enabled) return;
  const now = audioState.context.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    playTone(frequency, now + index * 0.095, 0.16, {
      type: "triangle",
      gain: 0.075,
      release: 0.06,
    });
  });
}

function neighborsOf(index) {
  const { x, y } = xy(index);
  return [
    x > 0 ? idx(x - 1, y) : null,
    x < state.cols - 1 ? idx(x + 1, y) : null,
    y > 0 ? idx(x, y - 1) : null,
    y < state.rows - 1 ? idx(x, y + 1) : null,
  ].filter((neighbor) => neighbor !== null);
}

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sameValueLinePenalty(cells = state.cells) {
  const anchors = cells
    .map((cell, index) => ({ ...xy(index), value: cell.value, active: cell.active }))
    .filter((cell) => cell.active && cell.value !== null);

  let penalty = 0;
  for (let i = 0; i < anchors.length; i += 1) {
    for (let j = i + 1; j < anchors.length; j += 1) {
      const a = anchors[i];
      const b = anchors[j];
      if (a.value !== b.value) continue;
      const sameRowClose = a.y === b.y && Math.abs(a.x - b.x) <= gameConfig.sameValueLineGap;
      const sameColClose = a.x === b.x && Math.abs(a.y - b.y) <= gameConfig.sameValueLineGap;
      if (sameRowClose || sameColClose) penalty += 1;
    }
  }

  return penalty;
}

function sameValueTouchPenalty(cells = state.cells) {
  let penalty = 0;

  cells.forEach((cell, index) => {
    if (!cell.active || cell.value === null) return;
    const { x, y } = xy(index);
    const right = x < state.cols - 1 ? cells[idx(x + 1, y)] : null;
    const down = y < state.rows - 1 ? cells[idx(x, y + 1)] : null;

    if (right?.active && right.value === cell.value) penalty += 1;
    if (down?.active && down.value === cell.value) penalty += 1;
  });

  return penalty;
}

function anchorLinePenalty(anchor, value) {
  let penalty = 0;
  state.cells.forEach((cell, index) => {
    if (!cell.active || cell.value !== value) return;
    const point = xy(index);
    const sameRowClose = point.y === anchor.y && Math.abs(point.x - anchor.x) <= gameConfig.sameValueLineGap;
    const sameColClose = point.x === anchor.x && Math.abs(point.y - anchor.y) <= gameConfig.sameValueLineGap;
    if (sameRowClose || sameColClose) penalty += 1;
  });
  return penalty;
}

function clonePieces(pieces) {
  return pieces.map((piece) => ({
    area: piece.area,
    cells: [...piece.cells],
  }));
}

function pointTouchesPiece(point, piece) {
  const pointIndex = idx(point.x, point.y);
  const cells = new Set(piece.cells);
  if (cells.has(pointIndex)) return false;

  return neighborsOf(pointIndex).some((neighbor) => cells.has(neighbor));
}

function generatedSameValueContactPenalty(placements) {
  let penalty = 0;

  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const a = placements[i];
      const b = placements[j];
      if (a.value !== b.value) continue;
      if (pointTouchesPiece(a.anchor, b.piece)) penalty += 1;
      if (pointTouchesPiece(b.anchor, a.piece)) penalty += 1;
    }
  }

  return penalty;
}

function anchorContactPenalty(anchor, value, piece, placements) {
  return placements.reduce((penalty, placement) => {
    if (placement.value !== value) return penalty;
    return (
      penalty +
      (pointTouchesPiece(anchor, placement.piece) ? 1 : 0) +
      (pointTouchesPiece(placement.anchor, piece) ? 1 : 0)
    );
  }, 0);
}

function growPiece(seed, unassigned, targetSize) {
  const cells = [seed];
  const frontier = [];
  unassigned.delete(seed);

  neighborsOf(seed).forEach((neighbor) => {
    if (unassigned.has(neighbor)) frontier.push(neighbor);
  });

  while (cells.length < targetSize && frontier.length) {
    const next = frontier.splice(randInt(0, frontier.length - 1), 1)[0];
    if (!unassigned.has(next)) continue;

    unassigned.delete(next);
    cells.push(next);

    shuffled(neighborsOf(next)).forEach((neighbor) => {
      if (unassigned.has(neighbor) && !frontier.includes(neighbor)) {
        frontier.push(neighbor);
      }
    });
  }

  return cells;
}

function mergeSinglePieces(pieces, config) {
  const owners = new Map();
  pieces.forEach((piece, pieceIndex) => {
    piece.cells.forEach((cellIndex) => owners.set(cellIndex, pieceIndex));
  });

  pieces.forEach((piece, pieceIndex) => {
    if (piece.cells.length !== 1) return;

    const neighborPieceIndexes = shuffled(neighborsOf(piece.cells[0]))
      .map((neighbor) => owners.get(neighbor))
      .filter((owner) => owner !== undefined && owner !== pieceIndex);
    const targetIndex =
      neighborPieceIndexes.find((owner) => pieces[owner].cells.length < config.maxArea) ?? neighborPieceIndexes[0];

    if (targetIndex === undefined) return;
    pieces[targetIndex].cells.push(piece.cells[0]);
    owners.set(piece.cells[0], targetIndex);
    piece.cells = [];
  });

  return pieces
    .filter((piece) => piece.cells.length > 0)
    .map((piece) => ({
      cells: piece.cells.sort((a, b) => a - b),
      area: piece.cells.length,
    }));
}

function buildConnectedPieces(config) {
  let best = null;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const unassigned = new Set(Array.from({ length: state.rows * state.cols }, (_, index) => index));
    const pieces = [];

    while (unassigned.size) {
      const seed = choice([...unassigned]);
      const maxSize = Math.min(config.maxArea, unassigned.size);
      let targetSize = unassigned.size === 1 ? 1 : randInt(2, maxSize);
      if (unassigned.size - targetSize === 1) {
        targetSize = targetSize > 2 ? targetSize - 1 : Math.min(maxSize, targetSize + 1);
      }
      const cells = growPiece(seed, unassigned, targetSize);
      pieces.push({ cells, area: cells.length });
    }

    const singleCount = pieces.filter((piece) => piece.cells.length === 1).length;
    if (!best || singleCount < best.singleCount) {
      best = { singleCount, pieces: clonePieces(pieces) };
    }
    if (singleCount === 0) return pieces;
  }

  return mergeSinglePieces(best.pieces, config);
}

function buildCells(config) {
  state.rows = config.rows;
  state.cols = config.cols;
  state.cells = Array.from({ length: state.rows * state.cols }, () => ({
    active: true,
    value: null,
    color: null,
  }));

  const pieces = buildConnectedPieces(config);

  const placements = [];
  pieces.forEach((piece, pieceIndex) => {
    const candidates = piece.cells.map((cellIndex) => xy(cellIndex));
    const anchor = candidates
      .map((candidate) => ({
        ...candidate,
        contactPenalty: anchorContactPenalty(candidate, piece.area, piece, placements),
        penalty: anchorLinePenalty(candidate, piece.area),
      }))
      .sort((a, b) => a.contactPenalty - b.contactPenalty || a.penalty - b.penalty || Math.random() - 0.5)[0];

    const cell = state.cells[idx(anchor.x, anchor.y)];
    cell.active = true;
    cell.value = piece.area;
    cell.color = fruitColors[pieceIndex % fruitColors.length];
    placements.push({
      anchor: { x: anchor.x, y: anchor.y },
      piece,
      value: piece.area,
    });
  });

  return {
    contactPenalty: generatedSameValueContactPenalty(placements),
  };
}

function cloneCells(cells) {
  return cells.map((cell) => ({ ...cell }));
}

function scoreAfterMove(move) {
  const savedCells = state.cells;
  state.cells = cloneCells(state.cells);

  rectCells(move).forEach((index) => {
    state.cells[index].active = false;
    state.cells[index].value = null;
  });

  try {
    const futureMoves = findMoves();
    const anchors = activeAnchors();
    const finishBonus = anchors === 0 ? 40 : 0;
    return futureMoves.length + anchors * 1.5 + finishBonus;
  } finally {
    state.cells = savedCells;
  }
}

function scoreMoveSet(moves) {
  const anchors = new Set(moves.map((move) => move.anchorIndex)).size;
  const areas = new Set(moves.map((move) => move.area)).size;
  const chunkyMoves = moves.filter((move) => move.w > 1 && move.h > 1).length;
  const futureScore = moves
    .slice(0, 16)
    .reduce((best, move) => Math.max(best, scoreAfterMove(move)), 0);
  return (
    moves.length +
    anchors * 2 +
    areas +
    chunkyMoves * 0.5 +
    futureScore * 0.25 -
    sameValueTouchPenalty() * 36 -
    sameValueLinePenalty() * 12
  );
}

function buildPlayableCells(config) {
  let best = null;

  for (let attempt = 0; attempt < boardCandidateCount; attempt += 1) {
    const generation = buildCells(config);
    const moves = findMoves();
    const contactPenalty = sameValueTouchPenalty();
    const generatedContactPenalty = generation.contactPenalty;
    const candidate = {
      rows: state.rows,
      cols: state.cols,
      cells: cloneCells(state.cells),
      moveCount: moves.length,
      linePenalty: sameValueLinePenalty(),
      contactPenalty,
      generatedContactPenalty,
      score: scoreMoveSet(moves) - generatedContactPenalty * 60,
    };

    const candidatePenalty = candidate.contactPenalty + candidate.generatedContactPenalty;
    const bestPenalty = best ? best.contactPenalty + best.generatedContactPenalty : Infinity;
    if (!best || candidatePenalty < bestPenalty || (candidatePenalty === bestPenalty && candidate.score > best.score)) {
      best = candidate;
    }

    if (
      moves.length >= config.targetMoves &&
      candidate.linePenalty === 0 &&
      candidate.contactPenalty === 0 &&
      candidate.generatedContactPenalty === 0
    ) {
      break;
    }
  }

  if (best) {
    state.rows = best.rows;
    state.cols = best.cols;
    state.cells = cloneCells(best.cells);
  }

  return best?.moveCount || 0;
}

function resetSelection() {
  state.selecting = false;
  state.hasDragged = false;
  state.activePointerId = null;
  state.start = null;
  state.end = null;
  state.selectionStatus = "neutral";
}

function cancelPendingEnd() {
  if (state.endTimer !== null) {
    clearTimeout(state.endTimer);
    state.endTimer = null;
  }
}

function resetGame() {
  cancelPendingEnd();
  resetSelection();
  state.bursts = [];
  state.toastUntil = 0;
  state.score = 0;
  state.timeLeft = gameConfig.time;
  state.combo = 0;
  state.chainUntil = 0;
  state.running = true;
  state.lastTick = performance.now();
  state.lastWarningSecond = null;
  overlayEl.hidden = true;

  buildPlayableCells(gameConfig);

  boardEl.style.setProperty("--cols", state.cols);
  if (audioState.started && audioState.enabled) startBgm();
  showToast("Ready");
  render();
}

function activeAnchors() {
  return state.cells.filter((cell) => cell.active && cell.value !== null).length;
}

function rectCells(rect) {
  const cells = [];
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      cells.push(idx(x, y));
    }
  }
  return cells;
}

function buildMovePrefixes() {
  const stride = state.cols + 1;
  const active = new Uint16Array((state.rows + 1) * stride);
  const anchors = new Uint16Array((state.rows + 1) * stride);

  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      const cell = state.cells[idx(x, y)];
      const prefixIndex = (y + 1) * stride + x + 1;
      const left = (y + 1) * stride + x;
      const top = y * stride + x + 1;
      const corner = y * stride + x;
      const isActive = cell.active ? 1 : 0;
      const isAnchor = cell.active && cell.value !== null ? 1 : 0;

      active[prefixIndex] = active[left] + active[top] - active[corner] + isActive;
      anchors[prefixIndex] = anchors[left] + anchors[top] - anchors[corner] + isAnchor;
    }
  }

  return { active, anchors, stride };
}

function sumPrefix(prefix, stride, rect) {
  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.w;
  const y2 = rect.y + rect.h;
  return (
    prefix[y2 * stride + x2] -
    prefix[y1 * stride + x2] -
    prefix[y2 * stride + x1] +
    prefix[y1 * stride + x1]
  );
}

function isRectCorner(rect, x, y) {
  const left = rect.x;
  const right = rect.x + rect.w - 1;
  const top = rect.y;
  const bottom = rect.y + rect.h - 1;
  return (x === left || x === right) && (y === top || y === bottom);
}

function areActiveCellsConnected(activeCells) {
  if (activeCells.length <= 1) return true;

  const activeSet = new Set(activeCells);
  const seen = new Set([activeCells[0]]);
  const stack = [activeCells[0]];

  while (stack.length) {
    const current = stack.pop();
    const { x, y } = xy(current);
    const neighbors = [
      x > 0 ? idx(x - 1, y) : null,
      x < state.cols - 1 ? idx(x + 1, y) : null,
      y > 0 ? idx(x, y - 1) : null,
      y < state.rows - 1 ? idx(x, y + 1) : null,
    ];

    neighbors.forEach((neighbor) => {
      if (neighbor === null || !activeSet.has(neighbor) || seen.has(neighbor)) return;
      seen.add(neighbor);
      stack.push(neighbor);
    });
  }

  return seen.size === activeCells.length;
}

function inspectRect(rect) {
  if (!rect || rect.w <= 0 || rect.h <= 0) return { ok: false, reason: "empty" };
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > state.cols || rect.y + rect.h > state.rows) {
    return { ok: false, reason: "bounds" };
  }

  const cells = rectCells(rect);
  const activeCells = cells.filter((index) => state.cells[index].active);
  const anchors = cells
    .map((index) => ({ index, cell: state.cells[index] }))
    .filter((item) => item.cell.active && item.cell.value !== null);

  if (anchors.length !== 1) return { ok: false, reason: "anchors" };

  const anchorPoint = xy(anchors[0].index);
  if (!isRectCorner(rect, anchorPoint.x, anchorPoint.y)) {
    return { ok: false, reason: "corner" };
  }

  const area = activeCells.length;
  if (area !== anchors[0].cell.value) return { ok: false, reason: "area" };
  if (!areActiveCellsConnected(activeCells)) return { ok: false, reason: "split" };

  return { ok: true, anchorIndex: anchors[0].index, area };
}

function findMoves() {
  const moves = [];
  const prefixes = buildMovePrefixes();

  state.cells.forEach((cell, index) => {
    if (!cell.active || cell.value === null) return;

    const { x: ax, y: ay } = xy(index);
    for (let y1 = 0; y1 <= ay; y1 += 1) {
      for (let x1 = 0; x1 <= ax; x1 += 1) {
        for (let y2 = ay; y2 < state.rows; y2 += 1) {
          for (let x2 = ax; x2 < state.cols; x2 += 1) {
            const rect = { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
            if (!isRectCorner(rect, ax, ay)) continue;

            const activeArea = sumPrefix(prefixes.active, prefixes.stride, rect);
            if (activeArea !== cell.value) continue;

            const anchorCount = sumPrefix(prefixes.anchors, prefixes.stride, rect);
            if (anchorCount === 1 && inspectRect(rect).ok) {
              moves.push({ ...rect, area: cell.value, anchorIndex: index });
            }
          }
        }
      }
    }
  });

  return moves;
}

function rectFromSelection() {
  if (!state.start || !state.end) return null;
  const x1 = Math.min(state.start.x, state.end.x);
  const y1 = Math.min(state.start.y, state.end.y);
  const x2 = Math.max(state.start.x, state.end.x);
  const y2 = Math.max(state.start.y, state.end.y);
  return { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
}

function cellFromPoint(event) {
  if (!state.boardGeometry) refreshBoardGeometry();
  const { rect, gap, padLeft, padTop, cellW, cellH } = state.boardGeometry;
  const localX = event.clientX - rect.left - padLeft;
  const localY = event.clientY - rect.top - padTop;

  const stepX = cellW + gap;
  const stepY = cellH + gap;
  const x = Math.floor(localX / stepX);
  const y = Math.floor(localY / stepY);
  const cellX = localX - x * stepX;
  const cellY = localY - y * stepY;

  if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return null;
  if (cellX < 0 || cellY < 0 || cellX > cellW || cellY > cellH) return null;
  return { x, y };
}

function isInside(rect, x, y) {
  return rect && x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

function showToast(text, duration = 900) {
  toastEl.textContent = text;
  state.toastUntil = performance.now() + duration;
}

function addScore(area) {
  const now = performance.now();
  if (now < state.chainUntil) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }

  state.chainUntil = now + gameConfig.chainWindow;
  const multiplier = 1 + Math.min(4, Math.floor((state.combo - 1) / 3));
  const chainBonus = state.combo > 1 ? state.combo * 2 : 0;
  const gained = area * 10 * multiplier + chainBonus;
  state.score += gained;

  const label = `+${gained}`;
  showToast(label);
  return { gained, label };
}

function addBurst(rect, label) {
  const id = `${Date.now()}-${Math.random()}`;
  state.bursts.push({
    id,
    label,
    x: ((rect.x + rect.w / 2) / state.cols) * 100,
    y: ((rect.y + rect.h / 2) / state.rows) * 100,
  });

  setTimeout(() => {
    state.bursts = state.bursts.filter((burst) => burst.id !== id);
    render();
  }, 620);
}

function clearRect(rect, area) {
  rectCells(rect).forEach((index) => {
    state.cells[index].active = false;
    state.cells[index].value = null;
  });

  const score = addScore(area);
  addBurst(rect, score.label);
  playSuccessSound(area, state.combo);

  const left = activeAnchors();
  const moves = findMoves();
  if (left === 0 || !moves.length) {
    showToast(left === 0 ? "Clear" : "No moves", 650);
    state.running = false;
    state.endTimer = setTimeout(() => {
      state.endTimer = null;
      endGame();
    }, 650);
  }
}

function finishSelection() {
  const rect = rectFromSelection();
  const check = inspectRect(rect);
  const wasTap = !state.hasDragged;

  resetSelection();

  if (!state.running) {
    render();
    return;
  }

  if (check.ok) {
    clearRect(rect, check.area);
  } else if (wasTap) {
    showToast("Drag a box", 500);
  } else {
    state.combo = 0;
    state.chainUntil = 0;
    state.score = Math.max(0, state.score - missScorePenalty);
    state.timeLeft = Math.max(0, state.timeLeft - missTimePenalty);
    playMissSound();
    showToast("Miss", 600);
  }

  render();
}

function endGame() {
  state.running = false;
  cancelPendingEnd();
  resetSelection();
  stopBgm();
  playEndSound();
  state.best = Math.max(state.best, state.score);
  localStorage.setItem("area-pop-best", String(state.best));
  finalScoreEl.textContent = state.score.toLocaleString();
  overlayEl.hidden = false;
  render();
}

function tick(now) {
  const dt = Math.max(0, (now - state.lastTick) / 1000);
  state.lastTick = now;

  if (state.running) {
    state.timeLeft -= dt;
    if (state.combo > 0 && now > state.chainUntil) {
      state.combo = 0;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame();
    } else if (state.timeLeft <= 10) {
      const warningSecond = Math.ceil(state.timeLeft);
      if (warningSecond !== state.lastWarningSecond) {
        state.lastWarningSecond = warningSecond;
        playWarningSound(warningSecond);
      }
    }
  }

  if (toastEl.textContent && now > state.toastUntil) {
    toastEl.textContent = "";
  }

  renderHud(now);
  requestAnimationFrame(tick);
}

function renderHud(now = performance.now()) {
  const timeRatio = Math.max(0, Math.min(1, state.timeLeft / gameConfig.time));
  const timeHue = 4 + timeRatio * 142;
  timeLabel.textContent = Math.ceil(state.timeLeft).toString();
  scoreLabel.textContent = state.score.toLocaleString();
  comboLabel.textContent = state.combo > 0 && now < state.chainUntil ? `${state.combo}x` : "0x";
  bestLabel.textContent = state.best.toLocaleString();
  const chain = Math.max(0, state.chainUntil - now) / gameConfig.chainWindow;
  chainFill.style.width = `${Math.round(chain * 100)}%`;
  timeFill.style.width = `${(timeRatio * 100).toFixed(3)}%`;
  timeFill.style.setProperty("--time-color", `hsl(${timeHue.toFixed(1)} 70% 46%)`);
}

function render() {
  const selection = rectFromSelection();

  if (state.selecting) {
    state.selectionStatus = "neutral";
  }

  const cells = state.cells
    .map((cell, index) => {
      const { x, y } = xy(index);
      const selected = isInside(selection, x, y);
      const classes = ["cell"];
      if (!cell.active) classes.push("removed");
      if (selected) classes.push("selected", state.selectionStatus);

      const fruit =
        cell.active && cell.value !== null
          ? `<span class="fruit" style="--fruit:${cell.color}">${cell.value}</span>`
          : "";

      return `<div class="${classes.join(" ")}" data-index="${index}">${fruit}</div>`;
    })
    .join("");

  const bursts = state.bursts
    .map(
      (burst) =>
        `<div class="burst" style="left:${burst.x}%; top:${burst.y}%">${burst.label}</div>`,
    )
    .join("");

  boardEl.innerHTML = cells + bursts;
  renderHud();
}

boardEl.addEventListener("pointerdown", (event) => {
  if (!state.running || state.selecting) return;
  ensureAudio();
  refreshBoardGeometry();
  const cell = cellFromPoint(event);
  if (!cell) return;
  cancelSelectionRender();

  boardEl.setPointerCapture(event.pointerId);
  state.selecting = true;
  state.hasDragged = false;
  state.activePointerId = event.pointerId;
  state.start = cell;
  state.end = cell;
  render();
});

boardEl.addEventListener("pointermove", (event) => {
  if (!state.selecting) return;
  if (event.pointerId !== state.activePointerId) return;
  const cell = cellFromPoint(event);
  if (!cell) return;
  if (cell.x !== state.end.x || cell.y !== state.end.y) {
    state.hasDragged = true;
    state.end = cell;
    scheduleSelectionRender();
  }
});

boardEl.addEventListener("pointerup", (event) => {
  if (!state.selecting) return;
  if (event.pointerId !== state.activePointerId) return;
  if (boardEl.hasPointerCapture(event.pointerId)) {
    boardEl.releasePointerCapture(event.pointerId);
  }
  cancelSelectionRender();
  finishSelection();
});

boardEl.addEventListener("pointercancel", (event) => {
  if (state.activePointerId !== null && event.pointerId !== state.activePointerId) return;
  cancelSelectionRender();
  resetSelection();
  render();
});

window.addEventListener("resize", invalidateBoardGeometry);

newButton.addEventListener("click", async () => {
  await ensureAudio();
  playResetSound();
  resetGame();
});
againButton.addEventListener("click", async () => {
  await ensureAudio();
  playResetSound();
  resetGame();
});
soundButton.addEventListener("click", async () => {
  setSoundEnabled(!audioState.enabled);
  if (audioState.enabled) {
    await ensureAudio();
    playResetSound();
  }
});

updateSoundButton();
resetGame();
requestAnimationFrame(tick);
