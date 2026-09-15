export const signalThresholds = [0, 0.15, 0.3, 0.48, 0.65, 0.82] as const;

export function signalStageIndex(progress: number) {
  const boundedProgress = Math.min(1, Math.max(0, progress));
  return signalThresholds.reduce<number>(
    (index, threshold, candidate) =>
      boundedProgress >= threshold ? candidate : index,
    0,
  );
}
