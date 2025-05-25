import { cn } from "@/lib/utils";
import useNodeEdgeStore from "@/store/node-edge";
import { useMemo } from "react";

interface MinimapProps {
  className?: string;
  zoom: number;
  offset: {
    x: number;
    y: number;
  };
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export const Minimap = ({ className, zoom, offset }: MinimapProps) => {
  const { nodes, edges } = useNodeEdgeStore();

  const bounds = useMemo<Bounds>(() => {
    if (nodes.length === 0) {
      return {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        width: 0,
        height: 0,
      };
    }

    const initialBounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };

    const calculatedBounds = nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        maxX: Math.max(acc.maxX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxY: Math.max(acc.maxY, node.position.y),
      }),
      initialBounds,
    );

    return {
      ...calculatedBounds,
      width: calculatedBounds.maxX - calculatedBounds.minX,
      height: calculatedBounds.maxY - calculatedBounds.minY,
    };
  }, [nodes]);

  const CONTAINER_SIZE = 240;
  const PADDING = 50;

  const contentWidth = bounds.width + PADDING * 2;
  const contentHeight = bounds.height + PADDING * 2;

  const scale =
    Math.min(CONTAINER_SIZE / contentWidth, CONTAINER_SIZE / contentHeight) *
    0.95;

  const boardElement = document.getElementById("board");
  const viewportWidth = boardElement?.clientWidth || window.innerWidth;
  const viewportHeight = boardElement?.clientHeight || window.innerHeight;

  const viewportWorld = {
    x: -offset.x / zoom,
    y: -offset.y / zoom,
    width: viewportWidth / zoom,
    height: viewportHeight / zoom,
  };

  const contentOffset = {
    x: (CONTAINER_SIZE - contentWidth * scale) / 2,
    y: (CONTAINER_SIZE - contentHeight * scale) / 2,
  };

  const indicator = {
    left: (viewportWorld.x - bounds.minX + PADDING) * scale,
    top: (viewportWorld.y - bounds.minY + PADDING) * scale,
    width: viewportWorld.width,
    height: viewportWorld.height,
  };

  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 w-60 h-60",
        "bg-white/90 backdrop-blur-md rounded-xl",
        "shadow-xl border border-gray-300/50 overflow-hidden z-[60]",
        className,
      )}>
      <div
        className="relative w-full h-full"
        style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}>
        {/* Background */}
        <div className="absolute inset-0 bg-gray-50" />

        {/* Scaled content container */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: contentWidth * scale,
            height: contentHeight * scale,
            left: contentOffset.x,
            top: contentOffset.y,
            transform: `scale${zoom / 100}`,
          }}>
          {/* Render nodes as dots */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"
              style={{
                left: (node.position.x - bounds.minX + PADDING) * scale,
                top: (node.position.y - bounds.minY + PADDING) * scale,
              }}
            />
          ))}

          {/* Render edges as lines */}
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.sourceId);
              const targetNode = nodes.find((n) => n.id === edge.targetId);
              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={edge.id}
                  x1={(sourceNode.position.x - bounds.minX + PADDING) * scale}
                  y1={(sourceNode.position.y - bounds.minY + PADDING) * scale}
                  x2={(targetNode.position.x - bounds.minX + PADDING) * scale}
                  y2={(targetNode.position.y - bounds.minY + PADDING) * scale}
                  className="stroke-blue-400"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>

          {/* Viewport indicator */}
          <div
            className="absolute border-2 border-blue-600 bg-blue-600/10"
            style={{
              left: indicator.left,
              top: indicator.top,
              width: indicator.width,
              height: indicator.height,
            }}
          />
        </div>
      </div>
    </div>
  );
};
