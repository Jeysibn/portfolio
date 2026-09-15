import { useCallback, useMemo, useState } from "react";
import type { Project } from "../../portfolio";

export function rotateDeck(projectIds: string[], selectedId: string) {
  const selectedIndex = projectIds.indexOf(selectedId);
  if (selectedIndex < 0) return projectIds;
  return [
    ...projectIds.slice(selectedIndex),
    ...projectIds.slice(0, selectedIndex),
  ];
}

export function useSystemDeck(projects: Project[]) {
  const projectIds = useMemo(() => projects.map((project) => project.id), [projects]);
  const [activeId, setActiveId] = useState(projectIds[0] ?? "");
  const [order, setOrder] = useState(projectIds);

  const reconciledOrder = useMemo(() => {
    const retained = order.filter((id) => projectIds.includes(id));
    const additions = projectIds.filter((id) => !retained.includes(id));
    return [...retained, ...additions];
  }, [order, projectIds]);

  const resolvedActiveId = projectIds.includes(activeId) ? activeId : (projectIds[0] ?? "");

  const selectProject = useCallback((selectedId: string) => {
    if (!projectIds.includes(selectedId)) return;

    setActiveId(selectedId);
    setOrder((currentOrder) => {
      const retained = currentOrder.filter((id) => projectIds.includes(id));
      const additions = projectIds.filter((id) => !retained.includes(id));
      return rotateDeck([...retained, ...additions], selectedId);
    });
  }, [projectIds]);

  const activeIndex = Math.max(0, projectIds.indexOf(resolvedActiveId));
  return {
    activeId: resolvedActiveId,
    activeIndex,
    order: reconciledOrder,
    selectProject,
  };
}
