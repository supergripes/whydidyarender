import { act, render } from "@testing-library/react";
import RenderOverlay from "./RenderOverlay";
import type { RenderFlashEvent } from "../hooks/useRenderTracking";

type Listener = (event: RenderFlashEvent) => void;

let listeners: Set<Listener>;

vi.mock("../hooks/useRenderTracking", () => ({
  subscribeToRenderEvents: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
}));

function emit(overrides: Partial<RenderFlashEvent> = {}) {
  const event: RenderFlashEvent = {
    id: "test",
    phase: "update",
    rect: { left: 0, top: 0, width: 10, height: 10 } as DOMRect,
    timestamp: 0,
    ...overrides,
  };
  for (const listener of listeners) listener(event);
}

describe("RenderOverlay", () => {
  beforeEach(() => {
    listeners = new Set();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing and does not subscribe when disabled", () => {
    const { container } = render(<RenderOverlay enabled={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(listeners.size).toBe(0);
  });

  it("draws a flash for a tracked render and removes it after the fade timeout", () => {
    const { container } = render(<RenderOverlay enabled />);
    expect(listeners.size).toBe(1);

    act(() => emit());
    expect(container.querySelectorAll(".render-flash")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelectorAll(".render-flash")).toHaveLength(0);
  });

  it("stops listening once turned off", () => {
    const { rerender } = render(<RenderOverlay enabled />);
    expect(listeners.size).toBe(1);

    rerender(<RenderOverlay enabled={false} />);
    expect(listeners.size).toBe(0);
  });
});
