import { describe, expect, it } from "vitest";
import { navigation, projects } from "./portfolio";

describe("portfolio content contract", () => {
  it("puts evidence-led sections before operating principles", () => {
    expect(navigation.map((item) => item.id)).toEqual([
      "projects",
      "experience",
      "skills",
      "credentials-title",
      "about",
      "resume",
      "contact",
    ]);
  });

  it("keeps every project linked to a real repository and architecture evidence", () => {
    for (const project of projects) {
      expect(project.repositoryUrl).toMatch(/^https:\/\/github\.com\//);
      expect(project.architecture.diagrams.length).toBeGreaterThan(0);
      expect(project.outcomes.length).toBeGreaterThan(0);
    }
  });
});
