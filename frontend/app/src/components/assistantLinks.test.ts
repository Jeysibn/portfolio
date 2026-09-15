import { describe, expect, it } from "vitest";
import { resolveAssistantLink } from "./assistantLinks";

describe("assistant link resolution", () => {
  it("maps same-site section sources to current-page hash links", () => {
    expect(
      resolveAssistantLink(
        { id: "professional-experience", label: "Professional experience", url: "https://jeysibn.github.io/#experience" },
        "https://jeysibn.github.io/",
      ),
    ).toEqual({ type: "section", label: "Professional experience", target: "experience" });

    expect(
      resolveAssistantLink(
        { id: "certifications", label: "Certifications", url: "https://jeysibn.github.io/#credentials-title" },
        "http://localhost:5173/",
      ),
    ).toEqual({ type: "section", label: "Certifications", target: "credentials" });

    expect(
      resolveAssistantLink(
        { id: "profile", label: "Portfolio profile", url: "https://jeysibn.github.io/" },
        "https://jeysibn.github.io/",
      ),
    ).toEqual({ type: "section", label: "Portfolio profile", target: "about" });
  });

  it("keeps external repositories external and safely rejects malformed URLs", () => {
    expect(
      resolveAssistantLink(
        { id: "project-homelab-gitops", label: "Homelab GitOps", url: "https://github.com/Jeysibn/homelab-gitops" },
        "https://jeysibn.github.io/",
      ),
    ).toEqual({
      type: "external",
      label: "Homelab GitOps",
      url: "https://github.com/Jeysibn/homelab-gitops",
    });

    expect(
      resolveAssistantLink(
        { id: "bad", label: "Bad link", url: "not a url" },
        "https://jeysibn.github.io/",
      ),
    ).toBeNull();

    expect(
      resolveAssistantLink(
        { id: "unknown", label: "Unknown section", url: "https://jeysibn.github.io/#not-a-section" },
        "https://jeysibn.github.io/",
      ),
    ).toBeNull();
  });
});
