import { useState } from "react";
import Dashboard from "./components/Dashboard";
import RenderCounter from "./components/RenderCounter";
import RenderOverlay from "./components/RenderOverlay";
import { resetRenderCounts } from "./hooks/useRenderTracking";

export default function App() {
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [liveClock, setLiveClock] = useState(false);

  return (
    <div data-overlay={overlayEnabled ? "on" : "off"} className="min-h-screen bg-neutral-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-x-4 gap-y-2 px-6 pt-4">
        <RenderCounter />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            __REACT_COMPILER_ENABLED__
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-neutral-500/15 text-neutral-400"
          }`}
        >
          React Compiler: {__REACT_COMPILER_ENABLED__ ? "on" : "off"}
        </span>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={liveClock}
            onChange={(e) => setLiveClock(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-950"
          />
          Live clock
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={overlayEnabled}
            onChange={(e) => setOverlayEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-950"
          />
          Render overlay
        </label>
        <button
          type="button"
          onClick={resetRenderCounts}
          className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:border-neutral-500"
        >
          Reset counts
        </button>
      </div>

      <Dashboard liveClock={liveClock} />
      <RenderOverlay enabled={overlayEnabled} />
    </div>
  );
}
