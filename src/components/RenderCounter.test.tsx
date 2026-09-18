import { act, render, screen } from "@testing-library/react";
import RenderCounter from "./RenderCounter";

type Listener = (event: { timestamp: number }) => void;

let listeners: Set<Listener>;

vi.mock("../hooks/useRenderTracking", () => ({
  subscribeToRenderEvents: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
}));

function emit(timestamp: number) {
  for (const listener of listeners) listener({ timestamp });
}

describe("RenderCounter", () => {
  beforeEach(() => {
    listeners = new Set();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("counts events from the last 10 seconds and prunes older ones as time passes", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    render(<RenderCounter />);
    expect(screen.getByText("Renders (10s): 0")).toBeInTheDocument();

    act(() => emit(now)); // t = 0s
    now = 3000;
    act(() => emit(now)); // t = 3s
    now = 6000;
    act(() => emit(now)); // t = 6s

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("Renders (10s): 3")).toBeInTheDocument();

    // t = 10.5s: the event from t=0 is now outside the 10s window
    now = 10500;
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("Renders (10s): 2")).toBeInTheDocument();

    // t = 16.5s: every event so far has aged out
    now = 16500;
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("Renders (10s): 0")).toBeInTheDocument();
  });

  it("unsubscribes from the event bus on unmount", () => {
    const { unmount } = render(<RenderCounter />);
    expect(listeners.size).toBe(1);

    unmount();

    expect(listeners.size).toBe(0);
  });
});
