import { useCallback, useMemo } from "react";
import useGlobalStore from "@/store/globals";
import { Node } from "@/store/globals";

type Connection = {
  id: string;
  sourceId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
};

export const ConnectionsLayer = () => {
  const { nodes, zoom, offset } = useGlobalStore();

  const worldToScreen = useCallback(
    (x: number, y: number) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const screenX = centerX + x * (zoom / 100) + offset.x;
      const screenY = centerY + y * (zoom / 100) + offset.y;
      return { x: screenX, y: screenY };
    },
    [zoom, offset],
  );

  const connections = useMemo(() => {
    const pipeNodes = nodes.filter((node) => node.type === "pipe");
    const junctionNodes = nodes.filter(
      (node) =>
        node.type === "junction" ||
        node.type === "square" ||
        node.type === "circle",
    );

    return pipeNodes
      .map((pipe) => {
        let closestJunction: Node | null = null;
        let minDistance = Infinity;

        // biome-ignore lint/complexity/noForEach: <explanation>
        junctionNodes.forEach((junction) => {
          const dx = pipe.x - junction.x;
          const dy = pipe.y - junction.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minDistance) {
            minDistance = distance;
            closestJunction = junction;
          }
        });

        if (!closestJunction) return null;

        const sourceScreen = worldToScreen(pipe.x, pipe.y);
        const targetScreen = worldToScreen(
          closestJunction.x,
          closestJunction.y,
        );

        return {
          id: `${pipe.id}-${closestJunction.id}`,
          sourceId: pipe.id,
          targetId: closestJunction.id,
          sourceX: sourceScreen.x,
          sourceY: sourceScreen.y,
          targetX: targetScreen.x,
          targetY: targetScreen.y,
        };
      })
      .filter(Boolean) as Connection[];
  }, [nodes, worldToScreen]);

  return (
    <svg className="absolute inset-0 z-10 pointer-events-none">
      {connections.map((conn) => (
        <line
          key={conn.id}
          x1={conn.sourceX}
          y1={conn.sourceY}
          x2={conn.targetX}
          y2={conn.targetY}
          stroke="#2563EB"
          strokeWidth={2}
          strokeDasharray={conn.sourceId.includes("pipe") ? "0" : "5,5"}
        />
      ))}
    </svg>
  );
};
