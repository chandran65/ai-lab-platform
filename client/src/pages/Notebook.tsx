import { useState } from "react";
import { execAPI } from "../services/api";
import { FileCode, Play, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Cell {
  id: string;
  code: string;
  output: string;
  running: boolean;
  collapsed: boolean;
}

let cellCounter = 0;

function createCell(): Cell {
  return {
    id: `cell-${++cellCounter}`,
    code: "",
    output: "",
    running: false,
    collapsed: false,
  };
}

const STARTER_CODE = `# Welcome to AI Lab Python Notebook!
# Try running some Python code:

import json

data = {"model": "CNN", "accuracy": 0.95, "epochs": 10}
print("Model Results:")
for key, value in data.items():
    print(f"  {key}: {value}")

print(f"\\nTotal parameters: {1024 * 512:,}")`;

export default function Notebook() {
  const [cells, setCells] = useState<Cell[]>([
    { ...createCell(), code: STARTER_CODE },
  ]);

  const updateCell = (id: string, updates: Partial<Cell>) => {
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const runCell = async (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell) return;
    updateCell(id, { running: true, output: "" });
    try {
      const res = await execAPI.run({ code: cell.code, language: "python", timeout: 10 });
      const output = res.data.error
        ? `${res.data.output || ""}${res.data.error}`
        : res.data.output || "No output";
      updateCell(id, { output, running: false });
    } catch {
      updateCell(id, { output: "Execution failed", running: false });
    }
  };

  const addCell = (afterId?: string) => {
    const newCell = createCell();
    if (afterId) {
      const idx = cells.findIndex((c) => c.id === afterId);
      const next = [...cells];
      next.splice(idx + 1, 0, newCell);
      setCells(next);
    } else {
      setCells((prev) => [...prev, newCell]);
    }
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    setCells((prev) => prev.filter((c) => c.id !== id));
  };

  const runAll = async () => {
    for (const cell of cells) {
      await runCell(cell.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="h-7 w-7 text-indigo-600" />
            Python Notebook
          </h1>
          <p className="text-slate-500 mt-1">Write and run Python code interactively</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            <Play className="h-4 w-4" />
            Run All
          </button>
          <button
            onClick={() => addCell()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add Cell
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {cells.map((cell, idx) => (
          <div key={cell.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button onClick={() => updateCell(cell.id, { collapsed: !cell.collapsed })}>
                  {cell.collapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                <span className="text-xs font-mono text-slate-400">In [{idx + 1}]</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => runCell(cell.id)}
                  disabled={cell.running}
                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 disabled:opacity-50"
                  title="Run cell"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => addCell(cell.id)}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
                  title="Add cell below"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCell(cell.id)}
                  className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
                  title="Delete cell"
                  disabled={cells.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!cell.collapsed && (
              <>
                <textarea
                  value={cell.code}
                  onChange={(e) => updateCell(cell.id, { code: e.target.value })}
                  className="w-full px-4 py-3 font-mono text-sm bg-slate-900 text-green-400 border-none outline-none resize-none min-h-24"
                  spellCheck={false}
                  placeholder="# Write Python code here..."
                  rows={Math.max(4, cell.code.split("\n").length)}
                />
                {(cell.output || cell.running) && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 font-mono text-sm">
                    {cell.running ? (
                      <span className="text-indigo-500 animate-pulse">Running...</span>
                    ) : (
                      <pre className="text-slate-700 whitespace-pre-wrap">{cell.output}</pre>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
