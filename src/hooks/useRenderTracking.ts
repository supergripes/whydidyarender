import { useCallback, useRef } from "react";
import type { ProfilerOnRenderCallback } from "react";

export interface RenderFlashEvent {
  id: string;
  phase: "mount" | "update" | "nested-update";
  rect: DOMRect;
  timestamp: number;
  container: boolean;
}

type Listener = (event: RenderFlashEvent) => void;

const listeners = new Set<Listener>();
const counts = new Map<string, number>();
const countListeners = new Map<string, Set<() => void>>();

export function subscribeToRenderEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders of `id` since page load or the last reset. Mounts don't count. */
export function getRenderCount(id: string): number {
  return counts.get(id) ?? 0;
}

export function subscribeToRenderCount(id: string, listener: () => void): () => void {
  let set = countListeners.get(id);
  if (!set) {
    set = new Set();
    countListeners.set(id, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function resetRenderCounts() {
  counts.clear();
  for (const set of countListeners.values()) {
    for (const listener of set) listener();
  }
}

function emitRenderEvent(event: RenderFlashEvent) {
  if (event.phase !== "mount") {
    counts.set(event.id, getRenderCount(event.id) + 1);
    const set = countListeners.get(event.id);
    if (set) for (const listener of set) listener();
  }
  for (const listener of listeners) listener(event);
}

interface TrackingOptions {
  /**
   * Containers (a page root, a table) re-render whenever anything inside
   * them does, so flashing them just paints the whole screen. They still
   * count towards badges and the render counter; they just don't flash.
   */
  container?: boolean;
}

/**
 * Thin wrapper around React's Profiler API. Attach `ref` to the DOM node
 * you want tracked, and pass `onRender` straight to a
 * `<Profiler id={id} onRender={onRender}>` boundary wrapping that same
 * node. Every commit of that boundary, mount or update, emits a render
 * event carrying the node's current position, which <RenderOverlay>
 * listens for to draw the flash. Updates also bump the per-id count shown
 * by <RenderBadge>.
 *
 * Each tracked instance needs its own unique id (e.g. `TableRow:${row.id}`)
 * since React's Profiler aggregates commits per id, not per component
 * instance.
 */
export function useRenderTracking<T extends HTMLElement = HTMLElement>(
  id: string,
  { container = false }: TrackingOptions = {},
) {
  const ref = useRef<T>(null);

  const onRender = useCallback<ProfilerOnRenderCallback>(
    (_id, phase) => {
      const node = ref.current;
      if (!node) return;
      emitRenderEvent({
        id,
        phase,
        rect: node.getBoundingClientRect(),
        timestamp: performance.now(),
        container,
      });
    },
    [id, container],
  );

  return { ref, onRender, id } as const;
}
