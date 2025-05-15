import {
  ChevronDown,
  ChevronRight,
  File,
  MenuIcon,
  Save,
  Upload,
} from "lucide-react";
import { useState } from "react";

import useNodeEdgeStore from "@/store/node-edge";
import type { Edge, Node } from "@/types/node-edge";

import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { Separator } from "./ui/separator";
import { useImportExportHandler } from "@/handlers/use-import-export-handler";

export const SidebarLeft = () => {
  const {
    nodes,
    edges,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
  } = useNodeEdgeStore();

  const [nodeListMenuOpen, setNodeListMenuOpen] = useState(true);
  const [edgeListMenuOpen, setEdgeListMenuOpen] = useState(true);

  const { exportData } = useImportExportHandler();

  return (
    <div className="w-full h-full p-2 overflow-y-auto text-xs text-gray-700 border-r">
      <div className="flex items-center justify-between p-2 text-xs font-semibold text-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex flex-row justify-end gap-1 px-3 py-1 space-x-2 max-w-max h-max"
              variant={"outline"}>
              <MenuIcon className="p-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            align="start"
            className="p-1 space-y-1 text-xs bg-white border rounded-lg shadow cursor-pointer w-max">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                <File className="w-3 h-3" />
                New
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                <Save className="w-3 h-3" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                <Upload className="w-3 h-3" />
                Load
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                <Upload className="w-3 h-3" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                onClick={() => exportData()}>
                <Upload className="w-3 h-3" />
                Export
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <h1 className="text-lg font-bold">WNS</h1>
      </div>

      <Separator className="h-0.5 bg-gray-200 rounded-md" />

      {/* Node List */}
      <Collapsible
        open={nodeListMenuOpen}
        onOpenChange={setNodeListMenuOpen}
        className="w-full space-y-0.5">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-700">
          <span>Nodes</span>
          {nodeListMenuOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-0.5">
          {nodes.length > 0 &&
            nodes.map((n: Node) => (
              <Button
                variant={"ghost"}
                onClick={() => {
                  setSelectedNodes([n]);
                  setSelectedEdges([]);
                }}
                key={n.id}
                className={`flex items-center justify-between px-2 py-1 text-xs font-semibold cursor-pointer h-max text-gray-700 rounded-sm ${
                  selectedNodes.some((sel) => sel.id === n.id)
                    ? "bg-blue-200"
                    : " hover:bg-gray-100"
                }`}>
                <span>{n.label}</span>
              </Button>
            ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator className="h-0.5 bg-gray-200 rounded-md mt-1" />

      {/* Edge List */}
      <Collapsible
        open={edgeListMenuOpen}
        onOpenChange={setEdgeListMenuOpen}
        className="w-full space-y-0.5">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-700">
          <span>Edges</span>
          {edgeListMenuOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-0.5">
          {edges.length > 0 &&
            edges.map((e: Edge) => (
              <Button
                variant={"ghost"}
                key={e.id}
                onClick={() => {
                  setSelectedEdges([e]);
                  setSelectedNodes([]);
                }}
                className={`flex items-center justify-between px-2 py-1 text-xs font-semibold cursor-pointer h-max text-gray-700 rounded-sm ${
                  selectedEdges.some((sel) => sel.id === e.id)
                    ? "bg-blue-200"
                    : " hover:bg-gray-100"
                }`}>
                <span>{e.label}</span>
              </Button>
            ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
