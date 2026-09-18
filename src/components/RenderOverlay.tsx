import { useEffect, useRef, useState } from "react";
import { subscribeToRenderEvents, type RenderFlashEvent } from "../hooks/useRenderTracking";

interface Flash extends RenderFlashEvent {
  key: number;
}

const FLASH_DURATION_MS = 500;

const PHASE_COLOR: Record<RenderFlashEvent["phase"], string> = {
  mount: "34, 197, 94", // green: first render
  update: "244, 63, 94", // red: re-render
  "nested-update": "244, 63, 94",
};

interface RenderOverlayProps {
  enabled: boolean;
}

export default function RenderOverlay({ enabled }: RenderOverlayProps) {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const nextKey = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setFlashes([]);
      return;
    }

    return subscribeToRenderEvents((event) => {
      const key = nextKey.current++;
      setFlashes((prev) => [...prev, { ...event, key }]);
      setTimeout(() => {
        setFlashes((prev) => prev.filter((flash) => flash.key !== key));
      }, FLASH_DURATION_MS);
    });
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {flashes.map((flash) => {
        const color = PHASE_COLOR[flash.phase];
        return (
          <div
            key={flash.key}
            className="render-flash absolute rounded-sm"
            style={{
              left: flash.rect.left,
              top: flash.rect.top,
              width: flash.rect.width,
              height: flash.rect.height,
              border: `2px solid rgb(${color})`,
              backgroundColor: `rgba(${color}, 0.18)`,
            }}
          />
        );
      })}
    </div>
  );
}
