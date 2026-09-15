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
    expect((document.querySelector(".capability-system") as HTMLElement).style.getPropertyValue("--domain-orbit-duration")).toBe("88s");
    expect(document.querySelector(".domain-1")?.getAttribute("style")).toContain("--skill-orbit-duration: 32s");

    fireEvent.click(screen.getByRole("button", { name: /Terraform/ }));
    expect(onOpen).toHaveBeenCalledWith({
      group: skillGroups.find((group) => group.label === "Infrastructure & delivery"),
      item: "Terraform",
    });
  });
});
