import { Circle, Filter, PenTool, Square, Zap } from "lucide-react";

import { createNode } from "@/lib/node-edge-factory";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

export const DockNodeTools = () => {
  const { offset, zoom } = useGlobalStore();
  const { addNode } = useNodeEdgeStore();

  return (
    <TooltipProvider>
      <div className="fixed z-50 flex flex-col p-2 space-y-2 transform -translate-x-1/2 bg-white shadow bottom-4 left-1/2 rounded-xl">
        <div className="flex flex-row space-x-2">
          {tools.map((tool) =>
            tool.id === "fitting" ? (
              <DropdownMenu key={tool.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-10 h-10 ${tool.color}`}>
                        {tool.icon}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent align="center">Fitting</TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  align="center"
                  onCloseAutoFocus={(e) => e.preventDefault()}>
                  <DropdownMenuItem
                    onSelect={() => {
                      const newNode = createNode(
                        "fitting",
                        "tee",
                        offset,
                        zoom,
                        "Tee Fitting",
                      );
                      addNode(newNode);
                    }}>
                    Tee Fitting
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const newNode = createNode(
                        "fitting",
                        "cross",
                        offset,
                        zoom,
                        "Cross Fitting",
                      );
                      addNode(newNode);
                    }}>
                    Cross Fitting
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const newNode = createNode(
                        "fitting",
                        "coupling",
                        offset,
                        zoom,
                        "Coupling Fitting",
                      );
                      addNode(newNode);
                    }}>
                    Coupling Fitting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 ${tool.color}`}
                    onClick={() => {
                      const newNode = createNode(
                        tool.id as NodeType,
                        "",
                        offset,
                        zoom,
                        tool.name,
                      );
                      addNode(newNode);
                    }}>
                    {tool.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="center">{tool.name}</TooltipContent>
              </Tooltip>
            ),
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
