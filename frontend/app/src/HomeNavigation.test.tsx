import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./components/SiteChrome";
import { Hero } from "./sections/PortfolioSections";

vi.mock("./api", () => ({
  fetchHealth: vi.fn().mockResolvedValue({}),
}));

afterEach(cleanup);

describe("home navigation", () => {
  it("keeps the wordmark as a relative link to the top anchor", () => {
    render(<SiteHeader activeSection="" theme="light" onTheme={vi.fn()} />);

    const wordmark = screen.getByRole("link", { name: "Jerome Ibon, home" });
    expect(wordmark).toHaveAttribute("href", "#top");
    expect(wordmark).not.toHaveAttribute("href", "https://jeysibn.github.io/");
  });

  it("provides one top anchor on the hero", () => {
    render(<Hero />);

    expect(document.querySelectorAll("#top")).toHaveLength(1);
    expect(document.querySelector("#top")).toHaveClass("hero");
  });

  it("keeps the restrained primary navigation targets", () => {
    render(<SiteHeader activeSection="" theme="light" onTheme={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Capabilities" })).toHaveAttribute("href", "#skills");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
  });
});
