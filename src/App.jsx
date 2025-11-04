import React, { useState, useEffect } from "react";
import "./ui.css";

// RushHour Board Builder
// Single-file React component (default export) that renders a 6x6 grid and UI
// to create cars (orientation H/V, length 2 or 3), place them by clicking the grid,
// edit/remove cars, mark the target (car 0), and export the board as a Python
// `cars` list: e.g. [("H", 2, 2, 0), ("V", 3, 0, 0), ...]
//
// Usage: paste this component into a React app (Create React App / Vite)
// - Tailwind CSS classes are used for styling; it will still look OK without Tailwind.
// - Default board size is 6 but you can change `BOARD_SIZE` constant.

const BOARD_SIZE = 6;

function insideBoard(r, c) {
  return r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE;
}

// Colors used for cars (will cycle when many cars are added)
const COLOR_PALETTE = [
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

function pickColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function textColorFromBg(hex) {
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
const CELL_SIZE = 96; // px per cell (increase to make the board bigger)
const GRID_GAP = 8; // px gap between cells

function cellsForCar(row, col, orient, length) {
  const cells = [];
  for (let i = 0; i < length; i++) {
    const rr = orient === "V" ? row + i : row;
    const cc = orient === "H" ? col + i : col;
    cells.push([rr, cc]);
  }
  return cells;
}

export default function RushHourBuilder() {
  const [cars, setCars] = useState([]); // {id, orient, length, row, col, isTarget}
  const [placing, setPlacing] = useState({ orient: "H", length: 2 });
  const [hoverPos, setHoverPos] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [exportContent, setExportContent] = useState(null);

  useEffect(() => {
    if (cars.length > 0) {
      // ensure first car is marked as target by default
      // and normalize colors so they match the current index order
      setCars((prev) => prev.map((c, i) => ({ ...c, isTarget: i === 0, color: pickColor(i) })));
    }
  }, [cars.length]);

  function occupiedMap(exceptId = null) {
    const map = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (const car of cars) {
      if (car.id === exceptId) continue;
      for (const [r, c] of cellsForCar(car.row, car.col, car.orient, car.length)) {
        if (insideBoard(r, c)) map[r][c] = car.id;
      }
    }
    return map;
  }

  function canPlaceAt(row, col, orient, length, exceptId = null) {
    for (const [r, c] of cellsForCar(row, col, orient, length)) {
      if (!insideBoard(r, c)) return false;
      const occ = occupiedMap(exceptId)[r][c];
      if (occ !== null) return false;
    }
    return true;
  }

  function handleGridClick(r, c) {
    // If a car is selected, move it to this position if possible
    if (selectedId !== null) {
      const car = cars.find((x) => x.id === selectedId);
      if (!car) return;
      if (canPlaceAt(r, c, car.orient, car.length, car.id)) {
        setCars((prev) => prev.map((x) => (x.id === car.id ? { ...x, row: r, col: c } : x)));
        setMessage("Moved car.");
      } else {
        setMessage("Can't move there — blocked or out of bounds.");
      }
      return;
    }

    // Otherwise try to place new car at this pos
    if (canPlaceAt(r, c, placing.orient, placing.length)) {
      const id = Date.now() + Math.random();
      const isTarget = cars.length === 0; // first car added becomes the target
      // pick a color based on current number of cars and store it on the car object
      setCars((prev) => [...prev, { id, orient: placing.orient, length: placing.length, row: r, col: c, isTarget, color: pickColor(prev.length) }]);
      setMessage("Placed new car.");
    } else {
      setMessage("Can't place here — blocked or out of bounds.");
    }
  }

  function handleRemove(id) {
    setCars((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, isTarget: i === 0 })));
    if (selectedId === id) setSelectedId(null);
  }

  function handleSetTarget(id) {
    setCars((prev) => prev.map((c) => ({ ...c, isTarget: c.id === id })));
  }

  function handleRotateSelected() {
    if (selectedId == null) return;
    setCars((prev) => {
      const car = prev.find((c) => c.id === selectedId);
      if (!car) return prev;
      const newOrient = car.orient === "H" ? "V" : "H";
      if (!canPlaceAt(car.row, car.col, newOrient, car.length, car.id)) {
        setMessage("Can't rotate here — would overlap or out of bounds.");
        return prev;
      }
      return prev.map((c) => (c.id === car.id ? { ...c, orient: newOrient } : c));
    });
  }

  function exportPython() {
    const lines = cars.map((c, idx) => {
      const orient = c.orient === "H" ? '"H"' : '"V"';
      return `(${orient}, ${c.length}, ${c.row}, ${c.col})`;
    });
    const arr = `[\n  ${lines.join(',\n  ')}\n]`;
    const full = `cars = ${arr}`;
    navigator.clipboard?.writeText(full).then(() => setMessage("Copied Python code to clipboard."), () => setMessage("Couldn't copy to clipboard — select and copy manually."));
    // Also show it in a modal-like area
    return full;
  }

  const exportText = exportPython; // function to call when pressing export

  // Render helpers
  const occ = occupiedMap();

  return (
    <div className="app-root">
      <div className="container">
        <h1 className="app-title">Rush Hour — Board Builder</h1>
        <div className="layout-grid">
          <div className="main-col">
            <div className="flex justify-center">
              <div className="panel" style={{ padding: 18 }}>
                <div
                  className="grid-container"
                  style={{
                    width: BOARD_SIZE * CELL_SIZE,
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                    gap: GRID_GAP,
                  }}
                >
                  {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                    Array.from({ length: BOARD_SIZE }).map((_, col) => {
                      const id = occ[row][col];
                      const car = cars.find((c) => c.id === id);
                      const isHover = hoverPos && hoverPos[0] === row && hoverPos[1] === col;

                      // compute inline style for colored car cells
                      const cellStyle = {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        border: '1px solid rgba(15,23,42,0.06)'
                      };
                      if (car) {
                        cellStyle.backgroundColor = car.color;
                        cellStyle.color = textColorFromBg(car.color);
                        // selected or target emphasis
                        if (selectedId === car.id) {
                          cellStyle.boxShadow = 'inset 0 0 0 4px rgba(59,130,246,0.85)';
                        } else if (car.isTarget) {
                          cellStyle.boxShadow = 'inset 0 0 0 4px rgba(16,185,129,0.65)';
                        }
                      } else if (isHover) {
                        cellStyle.backgroundColor = '#f1f5f9';
                      }

                      return (
                        <div
                          key={`${row}-${col}`}
                          onMouseEnter={() => setHoverPos([row, col])}
                          onMouseLeave={() => setHoverPos(null)}
                          onClick={() => handleGridClick(row, col)}
                          className={`cursor-pointer`}
                          style={cellStyle}
                        >
                          {car ? (
                            // show index only at the car's head (row,col)
                            car.row === row && car.col === col ? (
                              <div className="text-lg font-semibold">{cars.indexOf(car)}</div>
                            ) : null
                          ) : (
                            <div className="text-sm" style={{ color: '#64748b' }}>{row},{col}</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 items-center">
              <label className="flex items-center gap-2">
                <span className="text-sm">Orientation</span>
                <select
                  value={placing.orient}
                  onChange={(e) => setPlacing((p) => ({ ...p, orient: e.target.value }))}
                  className="form-select"
                >
                  <option value="H">Horizontal</option>
                  <option value="V">Vertical</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-sm">Length</span>
                <select
                  value={placing.length}
                  onChange={(e) => setPlacing((p) => ({ ...p, length: Number(e.target.value) }))}
                  className="form-select"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </label>

              <button onClick={() => { setSelectedId(null); setMessage('Click grid to place new car with current settings.'); }} className="btn btn-primary">Start placing</button>

              <button onClick={() => { setSelectedId(null); setMessage('Select a car from the list to move/edit it.'); }} className="btn btn-outline">Stop placing</button>
            </div>

            <div className="mt-3">
              <div className="panel">
                <h3 className="panel-title">Controls</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { if (selectedId) { handleRotateSelected(); } else setMessage('Select a car first.'); }} className="btn btn-outline">Rotate selected</button>
                  <button
                    onClick={() => {
                      // auto-fit selected car one step back if possible (move left/up)
                      if (!selectedId) return setMessage('Select a car first.');
                      const car = cars.find(c => c.id === selectedId);
                      if (!car) return;
                      const tryOffsets = car.orient === 'H' ? [[0,-1],[0,1]] : [[-1,0],[1,0]];
                      for (const [dr, dc] of tryOffsets) {
                        const nr = car.row + dr;
                        const nc = car.col + dc;
                        if (canPlaceAt(nr, nc, car.orient, car.length, car.id)) {
                          setCars(prev => prev.map(x => x.id===car.id?{...x,row:nr,col:nc}:x));
                          setMessage('Moved selected car.');
                          return;
                        }
                      }
                      setMessage('No nearby placement found.');
                    }}
                    className="btn btn-outline">Nudge selected</button>
                  <button onClick={() => { if (selectedId) handleRemove(selectedId); else setMessage('Select a car to remove.'); }} className="btn btn-danger">Remove selected</button>
                </div>
              </div>
            </div>
          </div>

          <div className="side-col">
            <div className="panel">
              <h3 className="panel-title">Cars ({cars.length})</h3>
              <div className="mt-2 space-y-2">
                {cars.map((car, idx) => (
                  <div key={car.id} className={`car-row ${selectedId===car.id? 'selected' : ''}`}> 
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="car-swatch" style={{ backgroundColor: car.color }} />
                        <div className="text-sm font-medium">{idx}{car.isTarget ? ' (target)' : ''}</div>
                      </div>
                      <div className="text-xs text-muted">{car.orient} × {car.length} @ {car.row},{car.col}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedId(car.id)} className="btn btn-outline btn-sm">Select</button>
                      <button onClick={() => handleSetTarget(car.id)} className="btn btn-outline btn-sm">Make target</button>
                      <button onClick={() => handleRemove(car.id)} className="btn btn-danger btn-sm">X</button>
                    </div>
                  </div>
                ))}

                {cars.length === 0 && <div className="text-sm text-muted">No cars yet. Click "Start placing" then click a grid cell to add one.</div>}
              </div>

              <div className="mt-3">
                <button onClick={() => {
                    const py = exportPython();
                    setExportContent(py);
                  }} className="btn btn-primary btn-full">Export Python code</button>

                <button onClick={() => {
                    // quick reset
                    if (!confirm('Remove all cars?')) return;
                    setCars([]);
                    setSelectedId(null);
                  }} className="btn btn-outline btn-full btn-danger-outline mt-2">Clear board</button>
              </div>
            </div>

            <div className="panel mt-3 text-sm text-muted">
              <strong>How to use</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Pick orientation & length and click "Start placing".</li>
                <li>Click a grid cell to place the new car.</li>
                <li>Select cars from the right to move/edit them (then click grid to move).</li>
                <li>Make one car the <em>target</em> (first car is target by default).</li>
                <li>Export the Python `cars` list and paste it into the solver.</li>
              </ol>
            </div>

            <div className="mt-3 text-sm text-muted">{message}</div>
            {exportContent && (
              <div className="panel mt-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Exported Python</strong>
                  <div>
                    <button onClick={() => { navigator.clipboard?.writeText(exportContent); setMessage('Copied export to clipboard.'); }} className="btn btn-outline btn-sm">Copy</button>
                    <button onClick={() => setExportContent(null)} className="btn btn-outline btn-sm" style={{ marginLeft: 8 }}>Close</button>
                  </div>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', marginTop: 10 }}>{exportContent.replace(/</g,'&lt;')}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
