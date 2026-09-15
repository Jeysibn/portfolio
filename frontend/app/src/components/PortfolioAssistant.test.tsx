import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioAssistant } from "./PortfolioAssistant";

const mocks = vi.hoisted(() => ({ sendChatMessage: vi.fn() }));

vi.mock("../api", () => ({
  fetchVisitorCount: vi.fn(),
  sendChatMessage: mocks.sendChatMessage,
}));

describe("portfolio assistant", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.sendChatMessage.mockReset();
  });

  it("keeps starter questions under visitor control", () => {
    render(<PortfolioAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /Ask this portfolio/ }));
    const question = "Tell me about MoniKey.";

    fireEvent.click(screen.getByRole("button", { name: question }));

    expect(screen.getByRole("textbox", { name: "Your question" })).toHaveValue(question);
    expect(mocks.sendChatMessage).not.toHaveBeenCalled();
  });

  it("renders sources and usage returned by the API", async () => {
    const experienceSection = document.createElement("section");
    experienceSection.id = "experience";
    document.body.appendChild(experienceSection);
    mocks.sendChatMessage.mockResolvedValue({
      reply: "Jerome currently has four documented projects:\n\n- **Cloud-Backed Portfolio** — Azure Functions and Cosmos DB.\n- `MoniKey` — PostgreSQL-backed durable jobs.",
      sources: [
        { id: "profile", label: "Portfolio profile", url: "https://jeysibn.github.io/" },
        { id: "professional-experience", label: "Professional experience", url: "https://jeysibn.github.io/#experience" },
        { id: "certifications", label: "Certifications", url: "https://jeysibn.github.io/#credentials-title" },
        { id: "project-monikey", label: "MoniKey", url: "https://github.com/Jeysibn/monikey" },
        { id: "bad", label: "Bad link", url: "not a url" },
      ],
      usage: { limit: 10, remaining: 9 },
    });
    render(<PortfolioAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /Ask this portfolio/ }));
    const input = screen.getByRole("textbox", { name: "Your question" });
    fireEvent.change(input, { target: { value: "Tell me about MoniKey." } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => expect(screen.getByText("MoniKey", { selector: "code" })).toBeInTheDocument());
    expect(screen.getByText("Cloud-Backed Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Cloud-Backed Portfolio").closest("ul")).toBeInTheDocument();
    expect(screen.getByText("Cloud-Backed Portfolio").closest("strong")).toBeInTheDocument();
    expect(screen.getByText("MoniKey", { selector: "code" })).toBeInTheDocument();
    const experienceLink = screen.getByRole("link", { name: "Professional experience" });
    expect(experienceLink).toHaveAttribute("href", "#experience");
    expect(experienceLink).not.toHaveAttribute("target");
    fireEvent.click(experienceLink);
    expect(window.location.hash).toBe("#experience");
    expect(screen.getByRole("link", { name: "Certifications" })).toHaveAttribute("href", "#credentials");
    expect(screen.getByRole("link", { name: "MoniKey" })).toHaveAttribute("href", "https://github.com/Jeysibn/monikey");
    expect(screen.getByRole("link", { name: "MoniKey" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "MoniKey" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByRole("link", { name: "Bad link" })).not.toBeInTheDocument();
    expect(screen.getByText("10 assistant questions per hour · 9 remaining")).toBeInTheDocument();
  });

  it("clears the conversation and restores the empty state", async () => {
    mocks.sendChatMessage.mockResolvedValue({ reply: "A grounded answer.", sources: [], usage: { limit: 10, remaining: 9 } });
    render(<PortfolioAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /Ask this portfolio/ }));
    const input = screen.getByRole("textbox", { name: "Your question" });
    fireEvent.change(input, { target: { value: "Tell me about Jerome." } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    await waitFor(() => expect(screen.getByText("A grounded answer.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));

    expect(screen.queryByText("A grounded answer.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tell me about MoniKey." })).toBeInTheDocument();
    expect(within(screen.getByRole("log", { name: "Assistant conversation" })).getByText(/Ask about Jerome/)).toBeInTheDocument();
  });
});
