import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { projects } from "../../portfolio";
import { SystemDeck } from "./SystemDeck";

describe("selected work spread", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("reorders without waiting for motion when reduced motion is enabled", () => {
    render(<SystemDeck projects={projects} onInspect={vi.fn()} />);

    const selector = screen.getByRole("navigation", { name: "Project selector" });
    fireEvent.click(within(selector).getByRole("button", { name: /Select project 03/ }));

    expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument();
    expect(within(selector).getByRole("button", { name: /Select project 03/ })).toHaveAttribute("aria-current", "true");
  });

  it("renders one editorial spread and changes the active project", async () => {
    const onInspect = vi.fn();
    render(<SystemDeck projects={projects} onInspect={onInspect} />);

    expect(document.querySelectorAll(".system-dossier")).toHaveLength(1);
    expect(document.querySelectorAll(".system-dossier.is-active")).toHaveLength(1);

    expect(screen.getByRole("heading", { name: "Cloud-Backed Portfolio" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Read the case study/ }));
    expect(onInspect).toHaveBeenCalledWith(projects[0]);
    const selector = screen.getByRole("navigation", { name: "Project selector" });
    expect(within(selector).getAllByRole("button", { name: /Select project/ })).toHaveLength(4);

    fireEvent.click(screen.getAllByRole("button", { name: /Select project 02/ })[0]);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Homelab GitOps Environment" })).toBeInTheDocument(),
    );
    expect(within(selector).getByRole("button", { name: /Select project 02/ })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: "Select next project" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select previous project" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Homelab GitOps Environment" })).toBeInTheDocument(),
    );

    fireEvent.keyDown(screen.getByLabelText(/Selected work/), { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(within(selector).getByRole("button", { name: /Select project 04/ }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "NOC Report Builder" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Select previous project" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "MoniKey" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Read the case study/ }));
    expect(onInspect).toHaveBeenCalledWith(projects[2]);
  });
});
