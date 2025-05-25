import { cn } from "@/lib/utils";
import useNodeEdgeStore from "@/store/node-edge";
import { useMemo } from "react";

interface MinimapProps {
  className?: string;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export const Minimap = ({ className }: MinimapProps) => {
  const { nodes, edges } = useNodeEdgeStore();

  const bounds = useMemo<Bounds>(() => {
    if (nodes.length === 0) {
      return {
        minX: -500,
        maxX: 500,
        minY: -500,
        maxY: 500,
        width: 1000,
        height: 1000,
      };
    }

    const NODE_SIZE = 64;
    const initialBounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };

    const calculatedBounds = nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x - NODE_SIZE / 2),
        maxX: Math.max(acc.maxX, node.position.x + NODE_SIZE / 2),
        minY: Math.min(acc.minY, node.position.y - NODE_SIZE / 2),
        maxY: Math.max(acc.maxY, node.position.y + NODE_SIZE / 2),
      }),
      initialBounds,
    );

    const CONTENT_PADDING = 200;
    return {
      minX: calculatedBounds.minX - CONTENT_PADDING,
      maxX: calculatedBounds.maxX + CONTENT_PADDING,
      minY: calculatedBounds.minY - CONTENT_PADDING,
      maxY: calculatedBounds.maxY + CONTENT_PADDING,
      width:
        calculatedBounds.maxX - calculatedBounds.minX + CONTENT_PADDING * 2,
      height:
        calculatedBounds.maxY - calculatedBounds.minY + CONTENT_PADDING * 2,
    };
  }, [nodes]);

  const MINIMAP_SIZE = 128;

  const scale = Math.min(
    MINIMAP_SIZE / bounds.width,
    MINIMAP_SIZE / bounds.height,
  );

  const worldToMinimap = (worldX: number, worldY: number) => ({
    x: (worldX - bounds.minX) * scale,
    y: (worldY - bounds.minY) * scale,
  });

  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 w-32 h-32",
        "bg-white/95 backdrop-blur-sm rounded-lg",
        "shadow-lg border border-gray-200 overflow-hidden z-[60]",
        className,
      )}>
      <div className="relative w-full h-full bg-gray-50">
        {/* Edges */}
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
        <svg className="absolute inset-0 w-full h-full">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.sourceId);
            const targetNode = nodes.find((n) => n.id === edge.targetId);
            if (!sourceNode || !targetNode) return null;

            const sourcePos = worldToMinimap(
              sourceNode.position.x,
              sourceNode.position.y,
            );
            const targetPos = worldToMinimap(
              targetNode.position.x,
              targetNode.position.y,
            );

            return (
              <line
                key={edge.id}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="#60a5fa"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = worldToMinimap(node.position.x, node.position.y);
          const nodeSize = Math.max(3, 4 * scale);

          return (
            <div
              key={node.id}
              className="absolute rounded-full shadow-sm"
              style={{
                left: pos.x - nodeSize / 2,
                top: pos.y - nodeSize / 2,
                width: nodeSize,
                height: nodeSize,
                backgroundColor: node.type === "tank" ? "#f97316" : "#2563eb",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
