import { Profiler, type ReactNode } from "react";
import { render } from "@testing-library/react";
import {
  getRenderCount,
  resetRenderCounts,
  subscribeToRenderCount,
  subscribeToRenderEvents,
  useRenderTracking,
  type RenderFlashEvent,
} from "./useRenderTracking";

function Tracked({
  id,
  container,
  children,
}: {
  id: string;
  container?: boolean;
  children?: ReactNode;
}) {
  const { ref, onRender, id: trackedId } = useRenderTracking<HTMLDivElement>(id, { container });
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

  it("flags events from container components", () => {
    const events: RenderFlashEvent[] = [];
    const unsubscribe = subscribeToRenderEvents((event) => events.push(event));

    render(
      <>
        <Tracked id="root" container />
        <Tracked id="leaf" />
      </>,
    );

    expect(events.find((event) => event.id === "root")?.container).toBe(true);
    expect(events.find((event) => event.id === "leaf")?.container).toBe(false);
    unsubscribe();
  });
});

describe("render counts", () => {
  beforeEach(() => resetRenderCounts());

  it("counts re-renders but not the initial mount", () => {
    const { rerender } = render(<Tracked id="counted">a</Tracked>);
    expect(getRenderCount("counted")).toBe(0);

    rerender(<Tracked id="counted">b</Tracked>);
    rerender(<Tracked id="counted">c</Tracked>);

    expect(getRenderCount("counted")).toBe(2);
  });

  it("notifies only the listener subscribed to that id", () => {
    const forA = vi.fn();
    const forB = vi.fn();
    const unsubscribeA = subscribeToRenderCount("count-a", forA);
    const unsubscribeB = subscribeToRenderCount("count-b", forB);

    const { rerender } = render(<Tracked id="count-a">1</Tracked>);
    rerender(<Tracked id="count-a">2</Tracked>);

    expect(forA).toHaveBeenCalledTimes(1);
    expect(forB).not.toHaveBeenCalled();
    unsubscribeA();
    unsubscribeB();
  });

  it("resets every count to zero and notifies listeners", () => {
    const { rerender } = render(<Tracked id="resettable">a</Tracked>);
    rerender(<Tracked id="resettable">b</Tracked>);
    expect(getRenderCount("resettable")).toBe(1);

    const listener = vi.fn();
    const unsubscribe = subscribeToRenderCount("resettable", listener);
    resetRenderCounts();

    expect(getRenderCount("resettable")).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
