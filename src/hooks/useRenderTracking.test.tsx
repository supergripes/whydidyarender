import { Profiler, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { subscribeToRenderEvents, useRenderTracking, type RenderFlashEvent } from "./useRenderTracking";

function Tracked({ id, children }: { id: string; children?: ReactNode }) {
  const { ref, onRender, id: trackedId } = useRenderTracking<HTMLDivElement>(id);
  return (
    <Profiler id={trackedId} onRender={onRender}>
      <div ref={ref}>{children}</div>
    </Profiler>
  );
}

describe("useRenderTracking", () => {
  it("emits a mount event carrying the given id when the component first renders", () => {
    const events: RenderFlashEvent[] = [];
    const unsubscribe = subscribeToRenderEvents((event) => events.push(event));

    render(<Tracked id="widget-1" />);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ id: "widget-1", phase: "mount" });
    unsubscribe();
  });

  it("emits an update event, not a fresh mount, when the same instance re-renders", () => {
    const events: RenderFlashEvent[] = [];
    const unsubscribe = subscribeToRenderEvents((event) => events.push(event));

    const { rerender } = render(<Tracked id="widget-2">a</Tracked>);
    rerender(<Tracked id="widget-2">b</Tracked>);

    expect(events.map((event) => event.phase)).toEqual(["mount", "update"]);
    unsubscribe();
  });

  it("keeps separate instances distinct, since React aggregates Profiler commits per id", () => {
    const events: RenderFlashEvent[] = [];
    const unsubscribe = subscribeToRenderEvents((event) => events.push(event));

    render(
      <>
        <Tracked id="row-1" />
        <Tracked id="row-2" />
      </>,
    );

    expect(events.map((event) => event.id).sort()).toEqual(["row-1", "row-2"]);
    unsubscribe();
  });

  it("stops delivering events to a listener after it unsubscribes", () => {
    const events: RenderFlashEvent[] = [];
    const unsubscribe = subscribeToRenderEvents((event) => events.push(event));
    unsubscribe();

    render(<Tracked id="widget-3" />);

    expect(events).toHaveLength(0);
  });
});
