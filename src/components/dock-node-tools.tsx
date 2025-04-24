import { Circle, PenTool, Square, Filter, Zap } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";

import { createNode } from "@/lib/node-factory";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

const tools = [
  { id: "fitting", name: "Fitting", icon: <PenTool size={18} /> },
  { id: "circle", name: "Reservoir", icon: <Circle size={18} /> },
  { id: "square", name: "Tank", icon: <Square size={18} /> },
  { id: "filter", name: "Valve", icon: <Filter size={18} /> },
  { id: "pump", name: "Pump", icon: <Zap size={18} /> },
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
                      <Button variant="ghost" size="icon" className="w-10 h-10">
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
                        offset,
                        zoom,
                        "Tee",
                      );
                      addNode(newNode);
                    }}>
                    Tee Fitting
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const newNode = createNode(
                        "fitting",
                        offset,
                        zoom,
                        "Cross",
                      );
                      addNode(newNode);
                    }}>
                    Cross Fitting
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const newNode = createNode(
                        "fitting",
                        offset,
                        zoom,
                        "Coupling",
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
                    className="w-10 h-10"
                    onClick={() => {
                      const newNode = createNode(
                        tool.id,
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
