import { describe, expect, it } from "vitest";
import { signalStageIndex, signalThresholds } from "./signalProgress";

describe("signal lifecycle progress", () => {
  it("keeps lifecycle stages in order as document progress increases", () => {
    const stages = [0, 0.1, 0.15, 0.3, 0.5, 0.7, 0.9, 1].map(signalStageIndex);

    expect(stages).toEqual([0, 0, 1, 2, 3, 4, 5, 5]);
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
    expect(signalThresholds).toHaveLength(6);
  });

  it("bounds progress outside the document range", () => {
    expect(signalStageIndex(-1)).toBe(0);
    expect(signalStageIndex(2)).toBe(5);
  });
});
