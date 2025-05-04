import { Circle, Filter, PenTool, Square, Zap } from "lucide-react";
import React from "react";

import { createNode } from "@/lib/node-edge-factory";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import { DockNodeFittingDropdown } from "./dock-node-fitting-dropdown";
import { DockNodeToolButton } from "./dock-node-tool-button";
import { TooltipProvider } from "./ui/tooltip";

import type { NodeType } from "@/types/node-edge";
const tools = [
  {
    id: "fitting",
    name: "Fitting",
    icon: <PenTool size={18} />,
    color: "bg-gray-300",
  },
  {
    id: "reservoir",
    name: "Reservoir",
    icon: <Circle size={18} />,
    color: "bg-blue-500",
  },
  {
    id: "tank",
    name: "Tank",
    icon: <Square size={18} />,
    color: "bg-orange-500",
  },
  {
    id: "valve",
    name: "Valve",
    icon: <Filter size={18} />,
    color: "bg-green-600",
  },
  { id: "pump", name: "Pump", icon: <Zap size={18} />, color: "bg-yellow-400" },
];

export const DockNodeTools = React.memo(() => {
  const { offset, zoom } = useGlobalStore();
  const { addNode } = useNodeEdgeStore();

  return (
    <TooltipProvider>
      <div className="fixed z-50 flex flex-col p-2 space-y-2 transform -translate-x-1/2 bg-white shadow bottom-4 left-1/2 rounded-xl">
        <div className="flex flex-row space-x-2">
          <DockNodeFittingDropdown />
          {tools
            .filter((tool) => tool.id !== "fitting")
            .map((tool) => (
              <DockNodeToolButton
                key={tool.id}
                color={tool.color}
                icon={tool.icon}
                name={tool.name}
                onClick={() => {
                  const newNode = createNode(
                    tool.id as NodeType,
                    "",
                    offset,
                    zoom,
                    tool.name,
                  );
                  addNode(newNode);
                }}
              />
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
});
