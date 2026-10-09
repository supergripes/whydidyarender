import { Profiler, type ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import { resetRenderCounts, useRenderTracking } from "../hooks/useRenderTracking";
import RenderBadge from "./RenderBadge";

function Tracked({ id, children }: { id: string; children?: ReactNode }) {
  const { ref, onRender, id: trackedId } = useRenderTracking<HTMLDivElement>(id);
  return (
    <Profiler id={trackedId} onRender={onRender}>
      <div ref={ref}>
        {children}
        <RenderBadge id={trackedId} />
      </div>
    </Profiler>
  );
}

function badge(id: string) {
  return screen.getByTitle(`${id}: re-renders since load or reset`);
}

describe("RenderBadge", () => {
  beforeEach(() => resetRenderCounts());

  it("starts at zero with the neutral heat level", () => {
    render(<Tracked id="badge-start" />);

    expect(badge("badge-start")).toHaveTextContent("×0");
    expect(badge("badge-start")).toHaveAttribute("data-heat", "0");
  });

  it("counts re-renders of its component without counting itself", () => {
    const { rerender } = render(<Tracked id="badge-count">a</Tracked>);

    rerender(<Tracked id="badge-count">b</Tracked>);
    rerender(<Tracked id="badge-count">c</Tracked>);

    // If the badge's own DOM updates were counted as renders, this would
    // keep climbing; two parent re-renders must mean exactly ×2.
    expect(badge("badge-count")).toHaveTextContent("×2");
    expect(badge("badge-count")).toHaveAttribute("data-heat", "1");
  });

  it("moves to hotter levels as the count grows", () => {
    const { rerender } = render(<Tracked id="badge-heat">0</Tracked>);

    for (let i = 1; i <= 3; i++) rerender(<Tracked id="badge-heat">{i}</Tracked>);
    expect(badge("badge-heat")).toHaveAttribute("data-heat", "2");

    for (let i = 4; i <= 10; i++) rerender(<Tracked id="badge-heat">{i}</Tracked>);
    expect(badge("badge-heat")).toHaveAttribute("data-heat", "3");
  });

  it("goes back to zero when counts are reset", () => {
    const { rerender } = render(<Tracked id="badge-reset">a</Tracked>);
    rerender(<Tracked id="badge-reset">b</Tracked>);
    expect(badge("badge-reset")).toHaveTextContent("×1");

    act(() => resetRenderCounts());

    expect(badge("badge-reset")).toHaveTextContent("×0");
    expect(badge("badge-reset")).toHaveAttribute("data-heat", "0");
  });
});
