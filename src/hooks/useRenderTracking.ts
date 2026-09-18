import { useCallback, useRef } from "react";
import type { ProfilerOnRenderCallback } from "react";

export interface RenderFlashEvent {
  id: string;
  phase: "mount" | "update" | "nested-update";
  rect: DOMRect;
  timestamp: number;
}

type Listener = (event: RenderFlashEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToRenderEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitRenderEvent(event: RenderFlashEvent) {
  for (const listener of listeners) listener(event);
}

/**
 * Thin wrapper around React's Profiler API. Attach `ref` to the DOM node
 * you want tracked, and pass `onRender` straight to a
 * `<Profiler id={id} onRender={onRender}>` boundary wrapping that same
 * node. Every commit of that boundary, mount or update, emits a render
 * event carrying the node's current position, which <RenderOverlay>
 * listens for to draw the flash.
 *
 * Each tracked instance needs its own unique id (e.g. `TableRow:${row.id}`)
 * since React's Profiler aggregates commits per id, not per component
 * instance.
 */
export function useRenderTracking<T extends HTMLElement = HTMLElement>(id: string) {
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
      });
    },
    [id],
  );

  return { ref, onRender, id } as const;
}
