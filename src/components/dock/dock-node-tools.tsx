import React from "react";

import { createNode } from "@/lib/node-edge-factory";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import { TooltipProvider } from "../ui/tooltip";
import { DockNodeFittingDropdown } from "./dock-node-fitting-dropdown";
import { DockNodeToolButton } from "./dock-node-tool-button";

import type { NodeType } from "@/types/node-edge";

const tools = [
  {
    id: "reservoir",
    name: "Reservoir",
    icon: (
      <img src="/assets/reservoir.svg" alt="Reservoir" className="w-5 h-5" />
    ),
  },
  {
    id: "tank",
    name: "Tank",
    icon: <img src="/assets/tank.svg" alt="Tank" className="w-5 h-5" />,
  },
  {
    id: "valve",
    name: "Valve",
    icon: <img src="/assets/valve.svg" alt="Valve" className="w-5 h-5" />,
  },
  {
    id: "pump",
    name: "Pump",
    icon: <img src="/assets/pump.svg" alt="Pump" className="w-5 h-5" />,
  },
];

export const DockNodeTools = React.memo(() => {
  const { offset, zoom } = useGlobalStore();
  const { addNode } = useNodeEdgeStore();

  return (
    <TooltipProvider>
      <div className="fixed z-50 flex flex-col p-2 space-y-2 transform -translate-x-1/2 bg-white shadow bottom-4 left-1/2 rounded-xl">
        <div className="flex flex-row space-x-2">
          <DockNodeFittingDropdown />
          {tools.map((tool) => (
            <DockNodeToolButton
              key={tool.id}
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
