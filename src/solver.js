import { BOARD_SIZE, insideBoard, cellsForCar } from './utils';

function stateKey(cars) {
  return cars.map(c => `${c.orient}:${c.length}:${c.row}:${c.col}`).join('|');
}

function cloneCars(cars) {
  return cars.map(c => ({ ...c }));
}

function buildOcc(cars) {
  const occ = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  cars.forEach((car, idx) => {
    for (const [r,c] of cellsForCar(car.row, car.col, car.orient, car.length)) {
      if (insideBoard(r,c)) occ[r][c] = idx;
    }
  });
  return occ;
}

function heuristicToGoal(cars) {
  const targetIdx = cars.findIndex(c => c.isTarget);
  if (targetIdx === -1) return 0;
  const t = cars[targetIdx];
  if (t.orient === 'H') {
    const exitCol = BOARD_SIZE - t.length;
    return Math.max(0, exitCol - t.col);
  } else {
    const exitRow = BOARD_SIZE - t.length;
    return Math.max(0, exitRow - t.row);
  }
}

function neighborsOf(cars) {
  const neighbors = [];
  const occ = buildOcc(cars);
  cars.forEach((car, idx) => {
    if (car.orient === 'H') {
      if (car.col > 0 && occ[car.row][car.col - 1] === null) {
        const next = cloneCars(cars);
        next[idx].col -= 1;
        neighbors.push({ state: next, move: { carIdx: idx, delta: -1 } });
      }
      const tailCol = car.col + car.length - 1;
      if (tailCol < BOARD_SIZE - 1 && occ[car.row][tailCol + 1] === null) {
        const next = cloneCars(cars);
        next[idx].col += 1;
        neighbors.push({ state: next, move: { carIdx: idx, delta: +1 } });
      }
    } else {
      if (car.row > 0 && occ[car.row - 1][car.col] === null) {
        const next = cloneCars(cars);
        next[idx].row -= 1;
        neighbors.push({ state: next, move: { carIdx: idx, delta: -1 } });
      }
      const tailRow = car.row + car.length - 1;
      if (tailRow < BOARD_SIZE - 1 && occ[tailRow + 1][car.col] === null) {
        const next = cloneCars(cars);
        next[idx].row += 1;
        neighbors.push({ state: next, move: { carIdx: idx, delta: +1 } });
      }
    }
  });
  return neighbors;
}

class MinHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this._up(this.data.length-1); }
  pop() { if (this.data.length===0) return null; const top=this.data[0]; const last=this.data.pop(); if(this.data.length>0){this.data[0]=last; this._down(0);} return top; }
  _up(i){ while(i>0){ const p=Math.floor((i-1)/2); if(this.data[p].f<=this.data[i].f) break; [this.data[p],this.data[i]]=[this.data[i],this.data[p]]; i=p; } }
  _down(i){ const n=this.data.length; while(true){ let l=2*i+1; let r=l+1; let smallest=i; if(l<n && this.data[l].f<this.data[smallest].f) smallest=l; if(r<n && this.data[r].f<this.data[smallest].f) smallest=r; if(smallest===i) break; [this.data[i],this.data[smallest]]=[this.data[smallest],this.data[i]]; i=smallest; } }
}

function isGoalState(cars) {
  const tIdx = cars.findIndex(c => c.isTarget);
  if (tIdx === -1) return false;
  const t = cars[tIdx];
  if (t.orient === 'H') {
    return t.col + t.length === BOARD_SIZE;
  } else {
    return t.row + t.length === BOARD_SIZE;
  }
}

export function solveAstar(initialCars, maxNodes = 200000) {
  const startKey = stateKey(initialCars);
  const open = new MinHeap();
  const h0 = heuristicToGoal(initialCars);
  open.push({ key: startKey, cars: cloneCars(initialCars), g: 0, f: h0 });
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(startKey, 0);
  let nodes = 0;

  while (true) {
    const node = open.pop();
    if (!node) return null;
    nodes++;
    if (nodes > maxNodes) return null;
    const { cars, g } = node;
    const key = stateKey(cars);
    if (isGoalState(cars)) {
      const moves = [];
      let cur = key;
      while (cameFrom.has(cur)) {
        const info = cameFrom.get(cur);
        moves.push(info.move);
        cur = info.prevKey;
      }
      moves.reverse();
      return moves;
    }

    const neigh = neighborsOf(cars);
    for (const { state: nbState, move } of neigh) {
      const nbKey = stateKey(nbState);
      const tentativeG = g + 1;
      if (!gScore.has(nbKey) || tentativeG < gScore.get(nbKey)) {
        gScore.set(nbKey, tentativeG);
        const f = tentativeG + heuristicToGoal(nbState);
        open.push({ key: nbKey, cars: nbState, g: tentativeG, f });
        cameFrom.set(nbKey, { prevKey: key, move });
      }
    }
  }
}

export function applyMoveToCars(cars, move) {
  const next = cloneCars(cars);
  const idx = move.carIdx;
  if (next[idx].orient === 'H') next[idx].col += move.delta;
  else next[idx].row += move.delta;
  return next;
}

