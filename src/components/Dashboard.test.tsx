import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";

function statValue(label: string) {
  return screen.getByText(label).nextElementSibling?.textContent;
}

describe("Dashboard", () => {
  it("shows all 60 mock rows and matching stats on first render", () => {
    render(<Dashboard />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(60);
    expect(statValue("Total rows")).toBe("60");
    expect(statValue("Visible")).toBe("60");
    expect(statValue("Selected")).toBe("0");
  });

  it("filters rows by name as you type, and the Visible stat matches what's rendered", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.type(screen.getByPlaceholderText("Search by name…"), "zzzzznotarealname");

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(statValue("Visible")).toBe("0");
  });

  it("filters rows by department", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.selectOptions(screen.getByDisplayValue("All departments"), "Engineering");

    const visibleRows = screen.getAllByRole("checkbox").length;
    expect(visibleRows).toBeGreaterThan(0);
    expect(visibleRows).toBeLessThan(60);
    expect(statValue("Visible")).toBe(String(visibleRows));
  });

  it("tracks selection count when toggling row checkboxes", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(statValue("Selected")).toBe("2");

    await user.click(checkboxes[0]);
    expect(statValue("Selected")).toBe("1");
  });
});
