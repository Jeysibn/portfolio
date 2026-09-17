import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { skillGroups } from "../../portfolio";
import { CapabilityMap } from "./CapabilityMap";

describe("capability field", () => {
  it("renders canonical domains and technology relationships", () => {
    const onOpen = vi.fn();
    render(<CapabilityMap onOpen={onOpen} />);

    expect(screen.getByLabelText("Interactive technical capability map")).toBeInTheDocument();
    expect(document.querySelectorAll(".capability-domain")).toHaveLength(skillGroups.length);
    expect(document.querySelectorAll(".capability-domain-heading button")).toHaveLength(skillGroups.length);
    expect(document.querySelectorAll(".capability-tool")).toHaveLength(
      skillGroups.reduce((total, group) => total + group.items.length, 0),
    );

    fireEvent.click(screen.getByRole("button", { name: /Terraform/ }));
    expect(onOpen).toHaveBeenCalledWith({
      group: skillGroups.find((group) => group.label === "Infrastructure & delivery"),
      item: "Terraform",
    });
  });

  it("keeps technology names scoped to each technology control", () => {
    render(<CapabilityMap onOpen={vi.fn()} />);

    const domain = document.querySelector(".capability-domain") as HTMLElement;
    const skill = domain.querySelector(".capability-tool") as HTMLElement;
    const skillLabel = skill.querySelector("span") as HTMLElement;

    fireEvent.mouseEnter(domain);
    expect(skillLabel).toHaveTextContent("Azure");

    fireEvent.focus(skill);
    expect(skill).toHaveAttribute("aria-label", "Azure — inspect Cloud & virtualization");
  });
});
