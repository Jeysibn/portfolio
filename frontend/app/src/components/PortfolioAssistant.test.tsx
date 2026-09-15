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
    mocks.sendChatMessage.mockResolvedValue({
      reply: "MoniKey uses PostgreSQL-backed durable jobs.",
      sources: [{ id: "project-monikey", label: "MoniKey", url: "https://github.com/Jeysibn/monikey" }],
      usage: { limit: 10, remaining: 9 },
    });
    render(<PortfolioAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /Ask this portfolio/ }));
    const input = screen.getByRole("textbox", { name: "Your question" });
    fireEvent.change(input, { target: { value: "Tell me about MoniKey." } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => expect(screen.getByText("MoniKey uses PostgreSQL-backed durable jobs.")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "MoniKey" })).toHaveAttribute("href", "https://github.com/Jeysibn/monikey");
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
