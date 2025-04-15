import useGlobalStore from "@/store/globals";
import { Circle, PenTool, MinusCircle, Square, Filter } from "lucide-react";
import { useCallback } from "react";
import { Button } from "./ui/button";

const tools = [
  { id: "pipe", name: "Pipe", icon: <MinusCircle size={16} /> },
  { id: "junction", name: "Junction", icon: <PenTool size={16} /> },
  { id: "circle", name: "Reservoir", icon: <Circle size={16} /> },
  { id: "square", name: "Tank", icon: <Square size={16} /> },
  { id: "filter", name: "Valve", icon: <Filter size={16} /> },
];

export const ToolsDock = () => {
  const { addNode, offset, zoom } = useGlobalStore();

  const handleAddNode = useCallback(
    (type: string) => {
      const centerScreenX = window.innerWidth / 2;
      const centerScreenY = window.innerHeight / 2;

      const adjustedX = centerScreenX - offset.x;
      const adjustedY = centerScreenY - offset.y;

      const worldX = adjustedX / (zoom / 100);
      const worldY = adjustedY / (zoom / 100);

      const newNode = {
        id: `${type}-${Date.now()}`,
        x: worldX,
        y: worldY,
        type,
      };

      addNode(newNode);
    },
    [addNode, offset, zoom],
  );

  return (
    <div className="fixed flex flex-col p-2 space-y-2 transform -translate-x-1/2 bg-white shadow top-4 left-1/2 rounded-xl">
      <div className="text-sm font-medium text-center text-gray-700">
        Network Components
      </div>
      <div className="flex flex-row space-x-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-16 gap-1 px-3"
            onClick={() => handleAddNode(tool.id)}>
            <div className="p-1 bg-gray-100 rounded-full">{tool.icon}</div>
            <span className="text-xs">{tool.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
