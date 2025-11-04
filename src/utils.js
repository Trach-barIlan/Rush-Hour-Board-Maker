// Utility functions and constants used across the app
export const BOARD_SIZE = 6;

export function insideBoard(r, c) {
  return r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE;
}

export function cellsForCar(row, col, orient, length) {
  const cells = [];
  for (let i = 0; i < length; i++) {
    const rr = orient === "V" ? row + i : row;
    const cc = orient === "H" ? col + i : col;
    cells.push([rr, cc]);
  }
  return cells;
}

// Colors used for cars (will cycle when many cars are added)
export const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

export function pickColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function textColorFromBg(hex) {
  // compute luminance of hex color to decide white/black text for contrast
  if (!hex) return '#fff';
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#000000' : '#ffffff';
}

// Board sizing (adjust to make the board larger)
export const CELL_SIZE = 96; // px per cell (increase to make the board bigger)
export const GRID_GAP = 8; // px gap between cells
