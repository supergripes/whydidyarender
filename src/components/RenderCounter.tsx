import { useEffect, useRef, useState } from "react";
import { subscribeToRenderEvents } from "../hooks/useRenderTracking";

const WINDOW_MS = 10_000;
const TICK_MS = 200;

/**
 * Live count of tracked render commits (mounts + updates, across every
 * component wrapped with useRenderTracking) in the trailing 10 seconds.
 * Independent of the flash overlay: this keeps counting even when the
 * overlay toggle is off, since it's meant to be the number that backs up
 * whatever the compiler on/off comparison shows visually.
 */
export default function RenderCounter() {
  const timestampsRef = useRef<number[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToRenderEvents((event) => {
      timestampsRef.current.push(event.timestamp);
    });

    const interval = setInterval(() => {
      const cutoff = performance.now() - WINDOW_MS;
      const timestamps = timestampsRef.current;
      let firstFresh = 0;
      while (firstFresh < timestamps.length && timestamps[firstFresh] < cutoff) {
        firstFresh++;
      }
      if (firstFresh > 0) timestamps.splice(0, firstFresh);
      setCount(timestamps.length);
    }, TICK_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="rounded-full bg-neutral-500/15 px-2 py-0.5 text-xs font-medium tabular-nums text-neutral-300">
      Renders (10s): {count}
    </span>
  );
}
