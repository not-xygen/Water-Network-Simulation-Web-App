import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { createNode } from "@/lib/node-edge-factory";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import React from "react";

export const DockNodeFittingDropdown = React.memo(() => {
  const { offset, zoom } = useGlobalStore();
  const { addNode } = useNodeEdgeStore();

  const addFitting = (subtype: string, label: string) => {
    const newNode = createNode("fitting", subtype, offset, zoom, label);
    addNode(newNode);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <img
                src="/src/assets/fitting.svg"
                alt="Fitting"
                className="w-5 h-5 select-none"
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent align="center">Fitting</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="center"
        onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuItem
          onSelect={() => addFitting("coupling", "Coupling Fitting")}>
          Coupling Fitting
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addFitting("elbow", "Elbow Fitting")}>
          Elbow Fitting
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addFitting("tee", "Tee Fitting")}>
          Tee Fitting
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addFitting("cross", "Cross Fitting")}>
          Cross Fitting
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
