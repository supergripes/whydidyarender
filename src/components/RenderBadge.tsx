import { useLayoutEffect, useRef } from "react";
import { getRenderCount, subscribeToRenderCount } from "../hooks/useRenderTracking";

function heatLevel(count: number) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 10) return 2;
  return 3;
}

interface RenderBadgeProps {
  id: string;
  className?: string;
}

/**
 * Shows how many times the component tracked under `id` has re-rendered.
 *
 * Updates the DOM directly instead of using React state: this badge lives
 * inside the tracked component's Profiler boundary, so a React commit from
 * the badge itself would be counted as a render of that component, which
 * would bump the count, which would update the badge, and so on forever.
 */
export default function RenderBadge({ id, className = "" }: RenderBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const count = getRenderCount(id);
      node.textContent = `×${count}`;
      node.dataset.heat = String(heatLevel(count));
    };

    update();
    return subscribeToRenderCount(id, update);
  }, [id]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      title={`${id}: re-renders since load or reset`}
      className={`render-badge ${className}`}
    />
  );
}
