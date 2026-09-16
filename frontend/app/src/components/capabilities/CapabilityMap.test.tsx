import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { skillGroups } from "../../portfolio";
import { CapabilityMap } from "./CapabilityMap";

describe("capability control plane", () => {
  it("renders canonical domains and technology relationships", () => {
    const onOpen = vi.fn();
    render(<CapabilityMap onOpen={onOpen} />);

    expect(screen.getByLabelText("Interactive technical capability map")).toBeInTheDocument();
    expect(document.querySelectorAll(".domain-orbit-slot")).toHaveLength(skillGroups.length);
    expect(document.querySelectorAll(".domain-anchor")).toHaveLength(skillGroups.length);
    expect(document.querySelectorAll(".orbit-skill")).toHaveLength(
      skillGroups.reduce((total, group) => total + group.items.length, 0),
    );
    expect(document.querySelector(".domain-inspection")).not.toBeInTheDocument();
    expect((document.querySelector(".capability-system") as HTMLElement).style.getPropertyValue("--domain-orbit-duration")).toBe("104s");
    expect(document.querySelector(".domain-1")?.getAttribute("style")).toContain("--skill-orbit-duration: 32s");

    fireEvent.click(screen.getByRole("button", { name: /Terraform/ }));
    expect(onOpen).toHaveBeenCalledWith({
      group: skillGroups.find((group) => group.label === "Infrastructure & delivery"),
      item: "Terraform",
    });
  });

  it("keeps technology names scoped to each technology control", () => {
    render(<CapabilityMap onOpen={vi.fn()} />);

    const system = document.querySelector(".capability-system") as HTMLElement;
    const domain = document.querySelector(".capability-domain") as HTMLElement;
    const skill = domain.querySelector(".orbit-skill") as HTMLElement;
    const skillLabel = skill.querySelector("span") as HTMLElement;

    fireEvent.mouseEnter(domain);
    expect(system).not.toHaveClass("has-inspected-domain");
    expect(domain).not.toHaveClass("is-inspected");
    expect(skillLabel).toHaveTextContent("Azure");

    fireEvent.focus(skill);
    expect(skill).toHaveAttribute("aria-label", "Azure — inspect Cloud & virtualization");
  });
});
