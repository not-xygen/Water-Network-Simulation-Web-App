import { Circle, PenTool, Square, Filter } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown";

import { createNode } from "@/lib/node-factory";

import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

const tools = [
  { id: "junction", name: "Junction", icon: <PenTool size={16} /> },
  { id: "circle", name: "Reservoir", icon: <Circle size={16} /> },
  { id: "square", name: "Tank", icon: <Square size={16} /> },
  { id: "filter", name: "Valve", icon: <Filter size={16} /> },
];

export const ToolsDock = () => {
  const { offset, zoom } = useGlobalStore();
  const { addNode } = useNodeEdgeStore();

  return (
    <div className="fixed z-10 flex flex-col p-2 space-y-2 transform -translate-x-1/2 bg-white shadow top-4 left-1/2 rounded-xl">
      <div className="flex flex-row space-x-2">
        {tools.map((tool) =>
          tool.id === "junction" ? (
            <DropdownMenu key={tool.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center justify-center h-16 gap-1 px-3">
                  <div className="p-1 bg-gray-100 rounded-full">
                    {tool.icon}
                  </div>
                  <span className="text-xs">{tool.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onSelect={() => {
                    const newNode = createNode("junction", offset, zoom, "T");
                    addNode(newNode);
                  }}>
                  Pipa T
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const newNode = createNode(
                      "junction",
                      offset,
                      zoom,
                      "4Way",
                    );
                    addNode(newNode);
                  }}>
                  Pipa 4 Arah
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const newNode = createNode(
                      "junction",
                      offset,
                      zoom,
                      "Inline",
                    );
                    addNode(newNode);
                  }}>
                  Pipa Sambung
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              className="flex flex-col items-center justify-center h-16 gap-1 px-3"
              onClick={() => {
                const newNode = createNode(tool.id, offset, zoom, tool.name);
                addNode(newNode);
              }}>
              <div className="p-1 bg-gray-100 rounded-full">{tool.icon}</div>
              <span className="text-xs">{tool.name}</span>
            </Button>
          ),
        )}
      </div>
    </div>
  );
};
