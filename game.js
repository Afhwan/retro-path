// ===== RETRO PATH - Game Engine =====

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ─── Constants ────────────────────────────────────────
const CELL = 52;
const GRID_W = 8;
const GRID_H = 8;
const PAD = 20;

canvas.width = GRID_W * CELL + PAD * 2;
canvas.height = GRID_H * CELL + PAD * 2;

// ─── Tile Types ───────────────────────────────────────
const T = {
  EMPTY: 0,
  START: 1,
  END: 2,
  STRAIGHT_H: 3,   // ─
  STRAIGHT_V: 4,   // │
  CORNER_TL: 5,    // top-left ┌ → right & down
  CORNER_TR: 6,    // top-right ┐ → left & down
  CORNER_BL: 7,    // bottom-left └ → right & up
  CORNER_BR: 8,    // bottom-right ┘ → left & up
  T_UP: 9,         // ┴
  T_DOWN: 10,      // ┬
  T_LEFT: 11,      // ├
  T_RIGHT: 12,     // ┤
  CROSS: 13,       // ┼
  PATH: 14,        // visited by character
  WALL: 15,        // obstacle — impassable
  LAVA: 16,        // lava — impassable, burns
};

// Block pool (what the player can place)
const BLOCK_TYPES = [
  T.STRAIGHT_H, T.STRAIGHT_V,
  T.CORNER_TL, T.CORNER_TR, T.CORNER_BL, T.CORNER_BR,
  T.T_UP, T.T_DOWN, T.T_LEFT, T.T_RIGHT,
  T.CROSS,
];

const BLOCK_CHARS = {
  [T.EMPTY]: '·',
  [T.START]: 'S',
  [T.END]: 'E',
  [T.STRAIGHT_H]: '─',
  [T.STRAIGHT_V]: '│',
  [T.CORNER_TL]: '┌',
  [T.CORNER_TR]: '┐',
  [T.CORNER_BL]: '└',
  [T.CORNER_BR]: '┘',
  [T.T_UP]:     '┴',
  [T.T_DOWN]:   '┬',
  [T.T_LEFT]:   '├',
  [T.T_RIGHT]:  '┤',
  [T.CROSS]:   '┼',
  [T.PATH]:    '★',
};

const BLOCK_ICONS = {
  [T.STRAIGHT_H]: '⬌',
  [T.STRAIGHT_V]: '⬍',
  [T.CORNER_TL]: '┌',
  [T.CORNER_TR]: '┐',
  [T.CORNER_BL]: '└',
  [T.CORNER_BR]: '┘',
  [T.T_UP]:     '┴',
  [T.T_DOWN]:   '┬',
  [T.T_LEFT]:   '├',
  [T.T_RIGHT]:  '┤',
  [T.CROSS]:   '┼',
};

// ─── Level Definitions ────────────────────────────────
const levels = [
  // ═══════ LEVEL 1-5: Basic ═══════
  // Level 1 - Tutorial (6x6, straight line right)
  // Path: (2,0)S → (2,1)→(2,2)→(2,3)→(2,4)→(2,5)E
  {
    gridW: 6, gridH: 6,
    start: { r: 2, c: 0 },
    end: { r: 2, c: 5 },
    givenBlocks: [T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H],
    solution: [
      { r: 2, c: 1, t: T.STRAIGHT_H },
      { r: 2, c: 2, t: T.STRAIGHT_H },
      { r: 2, c: 3, t: T.STRAIGHT_H },
      { r: 2, c: 4, t: T.STRAIGHT_H },
    ],
    reward: 10,
    obstacles: [{ r: 0, c: 0 }], // 1 tembok — perkenalan
  },
  // Level 2 - Right, down, right (6x6)
  // Path: (0,0)S → (0,1)┐ → (1,1)│ → (2,1)│ → (3,1)│ → (4,1)│ → (5,1)└ → (5,2)— → (5,3)— → (5,4)— → (5,5)E
  {
    gridW: 6, gridH: 6,
    start: { r: 0, c: 0 },
    end: { r: 5, c: 5 },
    givenBlocks: [T.CORNER_TR, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H],
    solution: [
      { r: 0, c: 1, t: T.CORNER_TR },
      { r: 1, c: 1, t: T.STRAIGHT_V },
      { r: 2, c: 1, t: T.STRAIGHT_V },
      { r: 3, c: 1, t: T.STRAIGHT_V },
      { r: 4, c: 1, t: T.STRAIGHT_V },
      { r: 5, c: 1, t: T.CORNER_BL },
      { r: 5, c: 2, t: T.STRAIGHT_H },
      { r: 5, c: 3, t: T.STRAIGHT_H },
      { r: 5, c: 4, t: T.STRAIGHT_H },
    ],
    reward: 15,
    obstacles: [{ r: 0, c: 3 }, { r: 3, c: 0 }], // 2 tembok
  },
  // Level 3 - Right, down, right (6x6)
  // Path: (2,0)S → (2,1)— → (2,2)┐ → (3,2)│ → (4,2)└ → (4,3)— → (4,4)— → (4,5)E
  {
    gridW: 6, gridH: 6,
    start: { r: 2, c: 0 },
    end: { r: 4, c: 5 },
    givenBlocks: [T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR, T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H, T.STRAIGHT_H],
    solution: [
      { r: 2, c: 1, t: T.STRAIGHT_H },
      { r: 2, c: 2, t: T.CORNER_TR },
      { r: 3, c: 2, t: T.STRAIGHT_V },
      { r: 4, c: 2, t: T.CORNER_BL },
      { r: 4, c: 3, t: T.STRAIGHT_H },
      { r: 4, c: 4, t: T.STRAIGHT_H },
    ],
    reward: 20,
    obstacles: [{ r: 1, c: 3 }, { r: 5, c: 0 }, { r: 0, c: 5 }, { r: 3, c: 5 }], // +2 tembok
  },
  // Level 4 - S-curve with obstacles (7x7)
  // Path: (3,0)S → (3,1)— → (3,2)┐ → (4,2)│ → (5,2)└ → (5,3)— → (5,4)┘ → (4,4)│ → (3,4)┌ → (3,5)— → (3,6)E
  {
    gridW: 7, gridH: 7,
    start: { r: 3, c: 0 },
    end: { r: 3, c: 6 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR, T.STRAIGHT_V, T.STRAIGHT_V,
      T.CORNER_BL, T.STRAIGHT_H, T.CORNER_BR, T.STRAIGHT_V, T.CORNER_TL, T.STRAIGHT_H,
    ],
    solution: [
      { r: 3, c: 1, t: T.STRAIGHT_H },
      { r: 3, c: 2, t: T.CORNER_TR },
      { r: 4, c: 2, t: T.STRAIGHT_V },
      { r: 5, c: 2, t: T.CORNER_BL },
      { r: 5, c: 3, t: T.STRAIGHT_H },
      { r: 5, c: 4, t: T.CORNER_BR },
      { r: 4, c: 4, t: T.STRAIGHT_V },
      { r: 3, c: 4, t: T.CORNER_TL },
      { r: 3, c: 5, t: T.STRAIGHT_H },
    ],
    reward: 25,
    obstacles: [{ r: 1, c: 3 }, { r: 4, c: 0 }, { r: 1, c: 5 }, { r: 6, c: 3 }], // +2 tembok
  },
  // Level 5 - Vertical with zigzag (7x7)
  // Path: (0,3)S → (1,3)│ → (2,3)│ → (3,3)│ → (4,3)│ → (5,3)│ → (6,3)E
  {
    gridW: 7, gridH: 7,
    start: { r: 0, c: 3 },
    end: { r: 6, c: 3 },
    givenBlocks: [
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
    ],
    solution: [
      { r: 1, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.STRAIGHT_V },
      { r: 3, c: 3, t: T.STRAIGHT_V },
      { r: 4, c: 3, t: T.STRAIGHT_V },
      { r: 5, c: 3, t: T.STRAIGHT_V },
    ],
    reward: 30,
    obstacles: [{ r: 2, c: 1 }, { r: 4, c: 5 }, { r: 0, c: 5 }, { r: 6, c: 1 }], // +2 tembok
  },

  // ═══════ LEVEL 6-10: Intermediate ═══════
  // Level 6 - Right, down, right (7x7)
  // Path: (0,0)S → (0,1)— → (0,2)┐ → (1,2)│ → (2,2)│ → (3,2)│ → (4,2)│ → (5,2)│ → (6,2)└ → (6,3)— → (6,4)— → (6,5)— → (6,6)E
  {
    gridW: 7, gridH: 7,
    start: { r: 0, c: 0 },
    end: { r: 6, c: 6 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR, T.STRAIGHT_V, T.STRAIGHT_V,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL,
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
    ],
    solution: [
      { r: 0, c: 1, t: T.STRAIGHT_H },
      { r: 0, c: 2, t: T.CORNER_TR },
      { r: 1, c: 2, t: T.STRAIGHT_V },
      { r: 2, c: 2, t: T.STRAIGHT_V },
      { r: 3, c: 2, t: T.STRAIGHT_V },
      { r: 4, c: 2, t: T.STRAIGHT_V },
      { r: 5, c: 2, t: T.STRAIGHT_V },
      { r: 6, c: 2, t: T.CORNER_BL },
      { r: 6, c: 3, t: T.STRAIGHT_H },
      { r: 6, c: 4, t: T.STRAIGHT_H },
      { r: 6, c: 5, t: T.STRAIGHT_H },
    ],
    reward: 35,
    obstacles: [
      { r: 1, c: 1 }, { r: 3, c: 0 }, { r: 5, c: 5 },
      { r: 2, c: 5 },
    ],
  },
  // Level 7 - Long path, zigzag corners (8x8)
  // Path: (0,0)S → (0,1)— → (0,2)— → (0,3)┐ → (1,3)│ → (2,3)│ → (3,3)│ → (4,3)│ → (5,3)│ → (6,3)│ → (7,3)└ → (7,4)— → (7,5)— → (7,6)— → (7,7)E
  {
    gridW: 8, gridH: 8,
    start: { r: 0, c: 0 },
    end: { r: 7, c: 7 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR, T.STRAIGHT_V,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
      T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
    ],
    solution: [
      { r: 0, c: 1, t: T.STRAIGHT_H },
      { r: 0, c: 2, t: T.STRAIGHT_H },
      { r: 0, c: 3, t: T.CORNER_TR },
      { r: 1, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.STRAIGHT_V },
      { r: 3, c: 3, t: T.STRAIGHT_V },
      { r: 4, c: 3, t: T.STRAIGHT_V },
      { r: 5, c: 3, t: T.STRAIGHT_V },
      { r: 6, c: 3, t: T.STRAIGHT_V },
      { r: 7, c: 3, t: T.CORNER_BL },
      { r: 7, c: 4, t: T.STRAIGHT_H },
      { r: 7, c: 5, t: T.STRAIGHT_H },
      { r: 7, c: 6, t: T.STRAIGHT_H },
    ],
    reward: 40,
    obstacles: [
      { r: 1, c: 1 }, { r: 3, c: 0 }, { r: 5, c: 5 },
      { r: 2, c: 6 }, { r: 5, c: 1 },
    ],
  },
  // Level 8 - Zigzag with correct corners (8x8)
  // Path: (0,3)S → (1,3)│ → (2,3)└ → (2,4)┐ → (3,4)│ → (4,4)┘ → (4,3)┌ → (5,3)│ → (6,3)│ → (7,3)E
  {
    gridW: 8, gridH: 8,
    start: { r: 0, c: 3 },
    end: { r: 7, c: 3 },
    givenBlocks: [
      T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL, T.CORNER_TR,
      T.STRAIGHT_V, T.CORNER_BR, T.CORNER_TL,
      T.STRAIGHT_V, T.STRAIGHT_V,
    ],
    solution: [
      { r: 1, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.CORNER_BL },
      { r: 2, c: 4, t: T.CORNER_TR },
      { r: 3, c: 4, t: T.STRAIGHT_V },
      { r: 4, c: 4, t: T.CORNER_BR },
      { r: 4, c: 3, t: T.CORNER_TL },
      { r: 5, c: 3, t: T.STRAIGHT_V },
      { r: 6, c: 3, t: T.STRAIGHT_V },
    ],
    reward: 45,
    obstacles: [
      { r: 1, c: 1 }, { r: 3, c: 5 }, { r: 5, c: 1 },
      { r: 6, c: 5 }, { r: 0, c: 5, type: 'lava' },
    ],
  },
  // Level 9 - Long snake with extra turns (8x8)
  // Path: (0,0)S → (0,1)— → (0,2)— → (0,3)┐ → (1,3)│ → (2,3)│ → (3,3)│ → (4,3)│ → (5,3)│ → (6,3)│ → (7,3)└ → (7,4)— → (7,5)— → (7,6)— → (7,7)E
  {
    gridW: 8, gridH: 8,
    start: { r: 0, c: 0 },
    end: { r: 7, c: 7 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
      T.CORNER_BL, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
    ],
    solution: [
      { r: 0, c: 1, t: T.STRAIGHT_H },
      { r: 0, c: 2, t: T.STRAIGHT_H },
      { r: 0, c: 3, t: T.CORNER_TR },
      { r: 1, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.STRAIGHT_V },
      { r: 3, c: 3, t: T.STRAIGHT_V },
      { r: 4, c: 3, t: T.STRAIGHT_V },
      { r: 5, c: 3, t: T.STRAIGHT_V },
      { r: 6, c: 3, t: T.STRAIGHT_V },
      { r: 7, c: 3, t: T.CORNER_BL },
      { r: 7, c: 4, t: T.STRAIGHT_H },
      { r: 7, c: 5, t: T.STRAIGHT_H },
      { r: 7, c: 6, t: T.STRAIGHT_H },
    ],
    reward: 50,
    obstacles: [
      { r: 1, c: 1 }, { r: 3, c: 0 }, { r: 5, c: 5 },
      { r: 2, c: 6 }, { r: 6, c: 1 }, { r: 0, c: 5 },
      { r: 4, c: 4, type: 'lava' },
    ],
  },
  // Level 10 - Complex multi-turn path (8x8)
  // Path: (4,0)S → (4,1)— → (4,2)— → (4,3)┘ → (3,3)│ → (2,3)│ → (1,3)└ → (1,4)— → (1,5)— → (1,6)— → (1,7)E
  {
    gridW: 8, gridH: 8,
    start: { r: 4, c: 0 },
    end: { r: 1, c: 7 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_BR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL,
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
    ],
    solution: [
      { r: 4, c: 1, t: T.STRAIGHT_H },
      { r: 4, c: 2, t: T.STRAIGHT_H },
      { r: 4, c: 3, t: T.CORNER_BR },
      { r: 3, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.STRAIGHT_V },
      { r: 1, c: 3, t: T.CORNER_BL },
      { r: 1, c: 4, t: T.STRAIGHT_H },
      { r: 1, c: 5, t: T.STRAIGHT_H },
      { r: 1, c: 6, t: T.STRAIGHT_H },
    ],
    reward: 55,
    obstacles: [
      { r: 4, c: 4 }, { r: 2, c: 0 }, { r: 6, c: 1 },
      { r: 0, c: 1 }, { r: 3, c: 5, type: 'lava' },
    ],
  },

  // ═══════ LEVEL 11-15: Advanced ═══════
  // Level 11 - Snake with wall cluster (8x8)
  // Path: (0,0)S → (0,1)— → (0,2)┐ → (1,2)│ → (2,2)│ → (3,2)│ → (4,2)└ → (4,3)— → (4,4)— → (4,5)┘ → (3,5)│ → (2,5)└ → (2,6)— → (2,7)E
  {
    gridW: 8, gridH: 8,
    start: { r: 0, c: 0 },
    end: { r: 2, c: 7 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
      T.CORNER_BL, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
      T.CORNER_BR, T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H,
    ],
    solution: [
      { r: 0, c: 1, t: T.STRAIGHT_H },
      { r: 0, c: 2, t: T.CORNER_TR },
      { r: 1, c: 2, t: T.STRAIGHT_V },
      { r: 2, c: 2, t: T.STRAIGHT_V },
      { r: 3, c: 2, t: T.STRAIGHT_V },
      { r: 4, c: 2, t: T.CORNER_BL },
      { r: 4, c: 3, t: T.STRAIGHT_H },
      { r: 4, c: 4, t: T.STRAIGHT_H },
      { r: 4, c: 5, t: T.CORNER_BR },
      { r: 3, c: 5, t: T.STRAIGHT_V },
      { r: 2, c: 5, t: T.CORNER_BL },
      { r: 2, c: 6, t: T.STRAIGHT_H },
    ],
    reward: 70,
    obstacles: [
      { r: 1, c: 0 }, { r: 3, c: 1 }, { r: 5, c: 2 },
      { r: 0, c: 5 }, { r: 1, c: 6 },
      { r: 7, c: 0, type: 'lava' },
    ],
  },
  // Level 12 - The T-junction gauntlet (8x8)
  // Path: (0,3)S → (1,3)│ → (2,3)│ → (3,3)│ → (4,3)│ → (5,3)└ → (5,4)— → (5,5)└ → (4,5)│ → (3,5)┌ → (3,6)— → (3,7)E
  {
    gridW: 8, gridH: 8,
    start: { r: 0, c: 3 },
    end: { r: 3, c: 7 },
    givenBlocks: [
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V,
      T.CORNER_BL, T.STRAIGHT_H, T.CORNER_BL,
      T.STRAIGHT_V, T.CORNER_TL, T.STRAIGHT_H,
    ],
    solution: [
      { r: 1, c: 3, t: T.STRAIGHT_V },
      { r: 2, c: 3, t: T.STRAIGHT_V },
      { r: 3, c: 3, t: T.STRAIGHT_V },
      { r: 4, c: 3, t: T.STRAIGHT_V },
      { r: 5, c: 3, t: T.CORNER_BL },
      { r: 5, c: 4, t: T.STRAIGHT_H },
      { r: 5, c: 5, t: T.CORNER_BL },
      { r: 4, c: 5, t: T.STRAIGHT_V },
      { r: 3, c: 5, t: T.CORNER_TL },
      { r: 3, c: 6, t: T.STRAIGHT_H },
    ],
    reward: 80,
    obstacles: [
      { r: 0, c: 1 }, { r: 2, c: 5 }, { r: 4, c: 7 },
      { r: 6, c: 2 }, { r: 7, c: 5 }, { r: 1, c: 7 },
      { r: 3, c: 1, type: 'lava' },
    ],
  },
  // Level 13 - Spiderweb (9x9, first 9-grid level)
  // Path: (4,0)S → (4,1)— → (4,2)— → (4,3)┐ → (5,3)│ → (6,3)│ → (7,3)└ → (7,4)— → (7,5)┐ → (8,5)│ → same as ...
  // Actually simpler: (1,0)S → down → right → up → right → down → right → (8,8)E
  {
    gridW: 9, gridH: 9,
    start: { r: 4, c: 0 },
    end: { r: 4, c: 8 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H,
    ],
    solution: [
      { r: 4, c: 1, t: T.STRAIGHT_H },
      { r: 4, c: 2, t: T.STRAIGHT_H },
      { r: 4, c: 3, t: T.STRAIGHT_H },
      { r: 4, c: 4, t: T.STRAIGHT_H },
      { r: 4, c: 5, t: T.STRAIGHT_H },
      { r: 4, c: 6, t: T.STRAIGHT_H },
      { r: 4, c: 7, t: T.STRAIGHT_H },
    ],
    reward: 90,
    obstacles: [
      { r: 2, c: 2 }, { r: 2, c: 4 }, { r: 2, c: 6 },
      { r: 6, c: 2 }, { r: 6, c: 4 }, { r: 6, c: 6 },
      { r: 0, c: 3 },
    ],
  },
  // Level 14 - The labyrinth (9x9)
  // Path: (0,0)S → down zigzag to (9,9)E
  // S→(1,0)│→(2,0)┐→(2,1)—→(2,2)┐→(3,2)│→(4,2)└→(4,3)—→(4,4)┘→(3,4)│→(2,4)└→(2,5)—→(2,6)┐→(3,6)│→(4,6)│→(5,6)└→(5,7)—→(5,8)E
  {
    gridW: 9, gridH: 9,
    start: { r: 0, c: 0 },
    end: { r: 5, c: 8 },
    givenBlocks: [
      T.STRAIGHT_V,
      T.CORNER_TR, T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H,
      T.CORNER_BR, T.STRAIGHT_V, T.CORNER_BL,
      T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H,
    ],
    solution: [
      { r: 1, c: 0, t: T.STRAIGHT_V },
      { r: 2, c: 0, t: T.CORNER_TR },
      { r: 2, c: 1, t: T.STRAIGHT_H },
      { r: 2, c: 2, t: T.CORNER_TR },
      { r: 3, c: 2, t: T.STRAIGHT_V },
      { r: 4, c: 2, t: T.CORNER_BL },
      { r: 4, c: 3, t: T.STRAIGHT_H },
      { r: 4, c: 4, t: T.CORNER_BR },
      { r: 3, c: 4, t: T.STRAIGHT_V },
      { r: 2, c: 4, t: T.CORNER_BL },
      { r: 2, c: 5, t: T.STRAIGHT_H },
      { r: 2, c: 6, t: T.CORNER_TR },
      { r: 3, c: 6, t: T.STRAIGHT_V },
      { r: 4, c: 6, t: T.STRAIGHT_V },
      { r: 5, c: 6, t: T.CORNER_BL },
      { r: 5, c: 7, t: T.STRAIGHT_H },
    ],
    reward: 100,
    obstacles: [
      { r: 1, c: 2 }, { r: 1, c: 4 }, { r: 1, c: 6 },
      { r: 3, c: 0 }, { r: 3, c: 8 },
      { r: 5, c: 2 }, { r: 5, c: 4 },
      { r: 7, c: 3 }, { r: 7, c: 5 },
      { r: 0, c: 1, type: 'lava' }, { r: 8, c: 8, type: 'lava' },
    ],
  },
  // Level 15 - The wall gauntlet (10x10, boss level)
  // Path: (4,0)S → (4,1)— → (4,2)— → (4,3)┐ → (5,3)│ → (6,3)└ → (6,4)— → (6,5)┘ → (5,5)│ → (4,5)│ → (3,5)└ → (3,6)— → (3,7)┐ → (4,7)│ → (5,7)│ → (6,7)│ → (7,7)└ → (7,8)— → (7,9)E
  {
    gridW: 10, gridH: 10,
    start: { r: 4, c: 0 },
    end: { r: 7, c: 9 },
    givenBlocks: [
      T.STRAIGHT_H, T.STRAIGHT_H, T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H, T.CORNER_BR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL,
      T.STRAIGHT_H, T.CORNER_TR,
      T.STRAIGHT_V, T.STRAIGHT_V, T.STRAIGHT_V, T.CORNER_BL, T.STRAIGHT_H,
    ],
    solution: [
      { r: 4, c: 1, t: T.STRAIGHT_H },
      { r: 4, c: 2, t: T.STRAIGHT_H },
      { r: 4, c: 3, t: T.CORNER_TR },
      { r: 5, c: 3, t: T.STRAIGHT_V },
      { r: 6, c: 3, t: T.CORNER_BL },
      { r: 6, c: 4, t: T.STRAIGHT_H },
      { r: 6, c: 5, t: T.CORNER_BR },
      { r: 5, c: 5, t: T.STRAIGHT_V },
      { r: 4, c: 5, t: T.STRAIGHT_V },
      { r: 3, c: 5, t: T.CORNER_BL },
      { r: 3, c: 6, t: T.STRAIGHT_H },
      { r: 3, c: 7, t: T.CORNER_TR },
      { r: 4, c: 7, t: T.STRAIGHT_V },
      { r: 5, c: 7, t: T.STRAIGHT_V },
      { r: 6, c: 7, t: T.STRAIGHT_V },
      { r: 7, c: 7, t: T.CORNER_BL },
      { r: 7, c: 8, t: T.STRAIGHT_H },
    ],
    reward: 150,
    obstacles: [
      { r: 2, c: 2 }, { r: 2, c: 4 }, { r: 2, c: 6 }, { r: 2, c: 8 },
      { r: 4, c: 4 }, { r: 4, c: 6 },
      { r: 6, c: 1 }, { r: 6, c: 9 },
      { r: 8, c: 3 }, { r: 8, c: 5 }, { r: 8, c: 7 },
      { r: 0, c: 5 },
      { r: 5, c: 0, type: 'lava' }, { r: 9, c: 4, type: 'lava' },
    ],
  },
];

// ─── Game State ────────────────────────────────────────
let currentLevel = 0;
let grid = [];
let gridW = 6;
let gridH = 6;
let inventory = [];
let selectedSlot = -1;
let isAnimating = false;
let playerPos = null;
let hintActive = false;
let placedCells = []; // Track cells the player has placed blocks on
let lives = 3;

// ─── Initialize Level ────────────────────────────────
function initLevel(levelIndex) {
  const level = levels[levelIndex];
  if (!level) {
    notify('Semua level selesai! Kamu juara! 🎉');
    showScreen('main-menu');
    return;
  }

  currentLevel = levelIndex;
  gridW = level.gridW;
  gridH = level.gridH;

  // Resize canvas
  canvas.width = gridW * CELL + PAD * 2;
  canvas.height = gridH * CELL + PAD * 2;

  // Initialize empty grid
  grid = [];
  for (let r = 0; r < gridH; r++) {
    grid[r] = [];
    for (let c = 0; c < gridW; c++) {
      grid[r][c] = T.EMPTY;
    }
  }

  // Place start & end
  grid[level.start.r][level.start.c] = T.START;
  grid[level.end.r][level.end.c] = T.END;

  // Place obstacles
  if (level.obstacles) {
    for (const obs of level.obstacles) {
      grid[obs.r][obs.c] = obs.type === 'lava' ? T.LAVA : T.WALL;
    }
  }

  // Setup inventory with random blocks from given blocks
  setupInventory(level.givenBlocks);

  // Reset state
  selectedSlot = -1;
  isAnimating = false;
  playerPos = null;
  hintActive = false;
  placedCells = [];
  lives = 3;
  updateLivesDisplay();

  // Auto-select first block
  if (inventory.length > 0) {
    selectedSlot = 0;
  }

  // Update UI
  document.getElementById('level-number').textContent = levelIndex + 1;
  document.getElementById('startBtn').disabled = false;
  document.getElementById('startBtn').textContent = '▶ MULAI';
  updateHUD();

  renderGrid();
  renderInventory();
}

// ─── Setup Inventory ────────────────────────────────
function setupInventory(givenBlocks) {
  // Shuffle and present blocks
  inventory = [...givenBlocks];
  // Sort: same types together
  inventory.sort((a, b) => a - b);
}

// ─── Render Grid ────────────────────────────────────
function renderGrid() {
  const level = levels[currentLevel];
  if (!level) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  for (let r = 0; r <= gridH; r++) {
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD + r * CELL);
    ctx.lineTo(PAD + gridW * CELL, PAD + r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c <= gridW; c++) {
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD + c * CELL, PAD);
    ctx.lineTo(PAD + c * CELL, PAD + gridH * CELL);
    ctx.stroke();
  }

  // Cells
  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      const x = PAD + c * CELL;
      const y = PAD + r * CELL;
      const tile = grid[r][c];

      if (tile === T.EMPTY) {
        // Subtle checkerboard
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#1a1a35';
          ctx.fillRect(x, y, CELL, CELL);
        }
        continue;
      }

      // Draw cell background based on type
      switch (tile) {
        case T.START:
          ctx.fillStyle = '#2ecc71';
          ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
          drawPixelText(x + CELL / 2, y + CELL / 2, 'S', '#fff', 18);
          break;
        case T.END:
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
          drawPixelText(x + CELL / 2, y + CELL / 2, 'E', '#fff', 18);
          break;
        case T.PATH:
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
          break;
        case T.WALL:
          ctx.fillStyle = '#1a0a0a';
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
          // Brick pattern
          ctx.strokeStyle = '#2a1515';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + CELL - 4, y + CELL - 4);
          ctx.moveTo(x + CELL - 4, y + 4); ctx.lineTo(x + 4, y + CELL - 4);
          ctx.stroke();
          // Border glow
          ctx.strokeStyle = '#ff3333';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
          ctx.globalAlpha = 1.0;
          break;
        case T.LAVA:
          // Lava pulsa glow — core berdenyut
          ctx.fillStyle = '#4a0f0a';
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
          // Top crust
          ctx.fillStyle = '#8a2a0a';
          ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
          // Crack lines
          ctx.strokeStyle = '#e85d1a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + CELL - 8, y + CELL - 8);
          ctx.moveTo(x + CELL - 8, y + 8); ctx.lineTo(x + 8, y + CELL - 8);
          ctx.stroke();
          // Glow core — berdenyut
          const pulse = 0.3 + 0.3 * Math.sin(lavaTime + (r + c) * 2);
          ctx.fillStyle = '#ff6b1a';
          ctx.globalAlpha = pulse;
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, 12, 0, Math.PI * 2);
          ctx.fill();
          // Inner hot core
          ctx.fillStyle = '#ffaa00';
          ctx.globalAlpha = pulse * 0.5;
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          // Outer glow
          ctx.strokeStyle = '#ff4400';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3 + 0.3 * Math.sin(lavaTime + (r + c) * 2);
          ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
          ctx.globalAlpha = 1.0;
          break;
        default:
          // Placed block - draw based on type
          drawPathTile(x, y, tile, '#4ecdc4');
          break;
      }
    }
  }

  // Draw hint overlay if active
  if (hintActive) {
    drawHints();
  }

  // Draw player character
  if (playerPos) {
    drawCharacter(playerPos.c, playerPos.r);
  }
}

// ─── Draw Path Tile ─────────────────────────────────
function drawPathTile(x, y, tile, color) {
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const hw = CELL / 2 - 3;  // lebih panjang — nyaris ke tepi
  const hh = CELL / 2 - 3;
  const lw = 10; // garis tebal

  ctx.fillStyle = '#1e2a4a';
  ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);

  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';

  // Draw connections based on tile type
  const connects = getConnections(tile);

  if (connects.up) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  if (connects.down) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + hh);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  if (connects.left) {
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  if (connects.right) {
    ctx.beginPath();
    ctx.moveTo(cx + hw, cy);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }

  // Center dot for non-straight tiles
  if (tile !== T.STRAIGHT_H && tile !== T.STRAIGHT_V) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Get Connections ────────────────────────────────
function getConnections(tile) {
  switch (tile) {
    case T.START:
    case T.END:
      // START and END connect in all directions so pathfinding can traverse them
      return { left: true, right: true, up: true, down: true };
    case T.STRAIGHT_H: return { left: true, right: true, up: false, down: false };
    case T.STRAIGHT_V: return { left: false, right: false, up: true, down: true };
    case T.CORNER_TL:  return { left: false, right: true, up: false, down: true };
    case T.CORNER_TR:  return { left: true, right: false, up: false, down: true };
    case T.CORNER_BL:  return { left: false, right: true, up: true, down: false };
    case T.CORNER_BR:  return { left: true, right: false, up: true, down: false };
    case T.T_UP:        return { left: true, right: true, up: false, down: true };
    case T.T_DOWN:      return { left: true, right: true, up: true, down: false };
    case T.T_LEFT:      return { left: false, right: true, up: true, down: true };
    case T.T_RIGHT:     return { left: true, right: false, up: true, down: true };
    case T.CROSS:      return { left: true, right: true, up: true, down: true };
    default:           return { left: false, right: false, up: false, down: false };
  }
}

// ─── Draw Character ─────────────────────────────────
function drawCharacter(col, row) {
  const x = PAD + col * CELL + CELL / 2;
  const y = PAD + row * CELL + CELL / 2;

  // Get active costume
  const data = loadShopData();
  const costumeColors = {
    default: '#ff6b35',
    ninja: '#2c3e50',
    robot: '#7f8c8d',
    wizard: '#9b59b6',
    dragon: '#e74c3c',
    ghost: '#bdc3c7',
  };
  const color = costumeColors[data.activeCostume?.replace('costume_', '')] || '#ff6b35';

  // Body — lebih besar
  ctx.fillStyle = color;
  ctx.fillRect(x - 11, y - 11, 22, 22);

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 7, y - 6, 5, 5);
  ctx.fillRect(x + 2, y - 6, 5, 5);

  // Eyes inner
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 6, y - 5, 3, 3);
  ctx.fillRect(x + 3, y - 5, 3, 3);
}

// ─── Draw Pixel Text ────────────────────────────────
function drawPixelText(x, y, text, color, size) {
  ctx.fillStyle = color;
  ctx.font = `${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// ─── Render Inventory ──────────────────────────────
function renderInventory() {
  const container = document.getElementById('block-slots');
  container.innerHTML = '';

  if (inventory.length === 0) {
    container.innerHTML = '<div class="block-slot empty">-</div>';
    return;
  }

  inventory.forEach((blockType, index) => {
    const slot = document.createElement('div');
    slot.className = 'block-slot' + (index === selectedSlot ? ' selected' : '');
    slot.textContent = BLOCK_ICONS[blockType] || '?';
    slot.title = `Blok ${BLOCK_CHARS[blockType] || blockType}`;
    slot.addEventListener('click', () => {
      selectBlock(index);
    });
    container.appendChild(slot);
  });
}

// ─── Select Block ──────────────────────────────────
function selectBlock(index) {
  if (isAnimating) return;
  selectedSlot = index;
  renderInventory();
  canvas.style.cursor = (inventory[index] || inventory[0]) ? 'crosshair' : 'default';
}

// ─── Canvas Click Handler ──────────────────────────
canvas.addEventListener('click', (e) => {
  if (isAnimating) return;
  
  // Auto-select first block if nothing selected and inventory not empty
  if (selectedSlot < 0 || selectedSlot >= inventory.length) {
    if (inventory.length > 0) {
      selectedSlot = 0;
      renderInventory();
    } else {
      return;
    }
  }

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const col = Math.floor((mx - PAD) / CELL);
  const row = Math.floor((my - PAD) / CELL);

  // Check bounds
  if (col < 0 || col >= gridW || row < 0 || row >= gridH) return;

  // Check if cell is a wall or lava (must come before empty check since WALL/LAVA are not EMPTY)
  if (grid[row][col] === T.WALL) {
    Sound.error();
    notify('Area terhalang tembok!');
    return;
  }
  if (grid[row][col] === T.LAVA) {
    Sound.error();
    notify('Area terkena lava panas!');
    return;
  }

  // Check if cell is empty
  if (grid[row][col] !== T.EMPTY) {
    Sound.error();
    notify('Area ini sudah terisi!');
    return;
  }

  // Place the block — always use first available slot (auto-advance)
  const blockType = inventory[selectedSlot];
  grid[row][col] = blockType;
  placedCells.push({ r: row, c: col });
  Sound.placeBlock();

  // Remove from inventory
  inventory.splice(selectedSlot, 1);
  selectedSlot = -1;

  renderGrid();
  renderInventory();
  canvas.style.cursor = inventory.length > 0 ? 'crosshair' : 'default';
  
  // Auto-select next block
  if (inventory.length > 0) {
    selectedSlot = 0;
    renderInventory();
  }
});

// ─── Canvas Right-click to remove ──────────────────
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (isAnimating) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const col = Math.floor((mx - PAD) / CELL);
  const row = Math.floor((my - PAD) / CELL);

  if (col < 0 || col >= gridW || row < 0 || row >= gridH) return;

  const tile = grid[row][col];
  // Can only remove placed blocks (not start/end)
  if (tile === T.START || tile === T.END || tile === T.EMPTY || tile === T.WALL) return;

  // Return block to inventory
  grid[row][col] = T.EMPTY;
  inventory.push(tile);
  placedCells = placedCells.filter(p => !(p.r === row && p.c === col));
  Sound.removeBlock();

  renderGrid();
  renderInventory();
});

// ─── Keyboard shortcuts ────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (document.getElementById('game-screen').classList.contains('active')) {
      if (!isAnimating) startPath();
    } else {
      showScreen('game-screen');
      initLevel(currentLevel);
    }
  }
  if (e.key === 'r' || e.key === 'R') {
    if (document.getElementById('game-screen').classList.contains('active')) {
      resetBoard();
    }
  }
  if (e.key === 'h' || e.key === 'H') {
    if (document.getElementById('game-screen').classList.contains('active')) {
      useHint();
    }
  }
});

// ─── Start Path ────────────────────────────────────
function startPath() {
  if (isAnimating) return;

  const level = levels[currentLevel];
  if (!level) return;

  // Cari jalur dari START
  const path = findPath();

  // Kalau gak ada jalur atau belum sampai END → lose life
  if (!path || path.length === 0 || path[path.length - 1].r !== level.end.r || path[path.length - 1].c !== level.end.c) {
    loseLife();
    return;
  }

  isAnimating = true;
  Sound.startPath();
  document.getElementById('startBtn').textContent = '⏳ BERJALAN...';

  // Animate character along the path
  animatePath(path);
}

// ─── Find Path (BFS) ───────────────────────────────
function findPath() {
  const level = levels[currentLevel];
  if (!level) return null;

  const start = level.start;
  const end = level.end;

  // BFS
  const visited = new Set();
  const queue = [{ r: start.r, c: start.c, path: [{ r: start.r, c: start.c }] }];
  visited.add(`${start.r},${start.c}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.r === end.r && current.c === end.c) {
      return current.path;
    }

    const tile = grid[current.r][current.c];
    const conns = getConnections(tile);

    // Check exit directions from current cell
    const neighbors = [];
    if (conns.up) neighbors.push({ r: current.r - 1, c: current.c, dir: 'up' });
    if (conns.down) neighbors.push({ r: current.r + 1, c: current.c, dir: 'down' });
    if (conns.left) neighbors.push({ r: current.r, c: current.c - 1, dir: 'left' });
    if (conns.right) neighbors.push({ r: current.r, c: current.c + 1, dir: 'right' });

    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (visited.has(key)) continue;
      if (n.r < 0 || n.r >= gridH || n.c < 0 || n.c >= gridW) continue;

      const nextTile = grid[n.r][n.c];
      if (nextTile === T.EMPTY) continue;

      // Check that the neighbor connects back to us
      const nextConns = getConnections(nextTile);
      const reverseDir = { up: 'down', down: 'up', left: 'right', right: 'left' };
      if (!nextConns[reverseDir[n.dir]]) continue;

      const newPath = [...current.path, { r: n.r, c: n.c }];
      queue.push({ r: n.r, c: n.c, path: newPath });
      visited.add(key);
    }
  }

  return null;
}

// ─── Animate Path ─────────────────────────────────
function animatePath(path) {
  let step = 0;

  function stepCharacter() {
    if (step >= path.length) {
      // Reached the end!
      isAnimating = false;
      document.getElementById('startBtn').textContent = '▶ MULAI';
      onLevelComplete();
      return;
    }

    const pos = path[step];
    playerPos = { r: pos.r, c: pos.c };

    Sound.step();

    // Mark cell as visited (except start)
    if (step > 0) {
      grid[pos.r][pos.c] = T.PATH;
    }

    renderGrid();
    step++;

    setTimeout(stepCharacter, 200);
  }

  stepCharacter();
}

// ─── Level Complete ────────────────────────────────
function onLevelComplete() {
  const level = levels[currentLevel];
  if (!level) return;

  const reward = level.reward;
  addCoins(reward);
  Sound.levelComplete();

  document.getElementById('reward-coins').textContent = reward;
  document.getElementById('level-complete').classList.remove('hidden');
}

// ─── Next Level ────────────────────────────────────
function nextLevel() {
  document.getElementById('level-complete').classList.add('hidden');
  currentLevel++;
  initLevel(currentLevel);
}

// ─── Reset Board ───────────────────────────────────
function resetBoard() {
  if (isAnimating) return;

  // Return all placed blocks to inventory
  for (const cell of placedCells) {
    const tile = grid[cell.r][cell.c];
    if (tile !== T.START && tile !== T.END && tile !== T.EMPTY) {
      inventory.push(grid[cell.r][cell.c]);
      grid[cell.r][cell.c] = T.EMPTY;
    }
  }
  placedCells = [];
  playerPos = null;
  hintActive = false;
  selectedSlot = -1;

  renderGrid();
  renderInventory();
  canvas.style.cursor = inventory.length > 0 ? 'crosshair' : 'default';
  document.getElementById('startBtn').textContent = '▶ MULAI';

  // Auto-select first block after reset
  if (inventory.length > 0) {
    selectedSlot = 0;
    renderInventory();
  }
}

// ─── Use Hint ──────────────────────────────────────
function useHint() {
  if (hintActive) return;

  const level = levels[currentLevel];
  if (!level) return;

  if (!spendHint()) {
    Sound.error();
    notify('Petunjuk habis! Beli di Toko.');
    return;
  }

  hintActive = true;
  renderGrid();

  // Timeout hint after a few seconds
  setTimeout(() => {
    hintActive = false;
    renderGrid();
  }, 5000);

  notify('Petunjuk aktif! Jalur yang benar ditandai.');
}

// ─── Draw Hints ────────────────────────────────────
function drawHints() {
  const level = levels[currentLevel];
  if (!level || !level.solution) return;

  for (const cell of level.solution) {
    const x = PAD + cell.c * CELL;
    const y = PAD + cell.r * CELL;

    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(x, y, CELL, CELL);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.setLineDash([]);
  }
}

// ─── Notification ──────────────────────────────────
function notify(message) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');

  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.classList.add('hidden');
  }, 2500);
}

// ─── Show Screen ───────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // Re-render canvas when returning to game
    if (id === 'game-screen') {
      setTimeout(() => renderGrid(), 50);
    }
  }
}

// ─── Update Player Cosmetic ──────────────────────────
function updatePlayerCosmetic(costumeId) {
  if (playerPos) {
    renderGrid();
  }
}

// ─── Lava Animation ──────────────────────────────────
let lavaTime = 0;
function animateLava() {
  lavaTime += 0.05;
  // Only re-render if lava exists on current grid and game screen is active
  if (document.getElementById('game-screen').classList.contains('active')) {
    let hasLava = false;
    for (let r = 0; r < gridH && !hasLava; r++) {
      for (let c = 0; c < gridW && !hasLava; c++) {
        if (grid[r][c] === T.LAVA) hasLava = true;
      }
    }
    if (hasLava && !isAnimating && !playerPos) {
      renderGrid();
    }
  }
  requestAnimationFrame(animateLava);
}

// ─── Toggle Sound ────────────────────────────────────
function toggleSound() {
  const muted = Sound.toggleMute();
  const btn = document.getElementById('muteBtn');
  btn.textContent = muted ? '🔇' : '🔊';
  btn.title = muted ? 'Suara mati' : 'Suara hidup';
}

// ─── Lives System ───────────────────────────────────
function updateLivesDisplay() {
  const el = document.getElementById('livesDisplay');
  if (!el) return;
  el.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
}

function loseLife() {
  if (isAnimating) return;
  lives--;
  updateLivesDisplay();
  Sound.fail();

  if (lives <= 0) {
    // Game Over
    setTimeout(() => {
      document.getElementById('game-over').classList.remove('hidden');
    }, 300);
  } else {
    // Still have lives — shake + reset
    const canvas = document.getElementById('gameCanvas');
    canvas.style.animation = 'shake 0.3s';
    setTimeout(() => {
      canvas.style.animation = '';
      resetBoard();
      notify(`Sisa ${lives} nyawa!`);
    }, 350);
  }
}

function retryLevel() {
  document.getElementById('game-over').classList.add('hidden');
  lives = 3;
  updateLivesDisplay();
  resetBoard();
  initLevel(currentLevel);
}

// ─── Initialize Game ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Sound.init();
  initLevel(0);
  animateLava();
});
