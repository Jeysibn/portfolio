import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { projects } from "../../portfolio";
import { SystemDeck } from "./SystemDeck";
import { rotateDeck } from "./useSystemDeck";

describe("system deck", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("keeps a circular logical order when a project is selected", () => {
    expect(rotateDeck(["one", "two", "three", "four"], "three")).toEqual([
      "three",
      "four",
      "one",
      "two",
    ]);
  });

  it("reorders without waiting for motion when reduced motion is enabled", () => {
    render(<SystemDeck projects={projects} onInspect={vi.fn()} />);

    const selector = screen.getByRole("navigation", { name: "System selector" });
    fireEvent.click(within(selector).getByRole("button", { name: /Select system 03/ }));

    expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument();
    expect(within(selector).getByRole("button", { name: /Select system 03/ })).toHaveAttribute("aria-current", "true");
  });

  it("renders four discoverable systems and changes the active system", async () => {
    const onInspect = vi.fn();
    render(<SystemDeck projects={projects} onInspect={onInspect} />);

    expect(document.querySelectorAll(".system-dossier")).toHaveLength(4);
    expect(document.querySelectorAll(".system-dossier.is-active")).toHaveLength(1);
    expect(document.querySelectorAll(".system-dossier.is-background .system-dossier-content a")).toHaveLength(3);
    expect(
      [...document.querySelectorAll(".system-dossier.is-background .system-dossier-content a")].every(
        (link) => link.getAttribute("tabindex") === "-1",
      ),
    ).toBe(true);

    expect(screen.getByRole("heading", { name: "Cloud-Backed Portfolio" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open case study/ }));
    expect(onInspect).toHaveBeenCalledWith(projects[0]);
    const selector = screen.getByRole("navigation", { name: "System selector" });
    expect(within(selector).getAllByRole("button", { name: /Select system/ })).toHaveLength(4);

    fireEvent.click(screen.getAllByRole("button", { name: /Select system 02/ })[0]);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Homelab GitOps Environment" })).toBeInTheDocument(),
    );
    expect(within(selector).getByRole("button", { name: /Select system 02/ })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: "Select next system" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select previous system" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Homelab GitOps Environment" })).toBeInTheDocument(),
    );

    fireEvent.keyDown(screen.getByLabelText(/System deck/), { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(within(selector).getByRole("button", { name: /Select system 04/ }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "NOC Report Builder" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select previous system" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Inspect system/ }));
    expect(onInspect).toHaveBeenCalledWith(projects[2]);
  });
});
