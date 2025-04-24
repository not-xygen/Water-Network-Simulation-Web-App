import type { Node, Edge } from "@/store/node-edge";
import { ChevronDown, RotateCcw, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { Separator } from "./ui/separator";

type SidebarRightProps = {
  node: Node | null;
  edge: Edge | null;
  onClearSelection: () => void;
};

export const SidebarRight = ({
  node,
  edge,
  onClearSelection,
}: SidebarRightProps) => {
  const { zoom, resetZoom, zoomIn, zoomOut, offset, setOffset } =
    useGlobalStore();
  const { removeNode, removeEdge } = useNodeEdgeStore();

  const resetPosition = () => {
    setOffset(0, 0);
  };

  const displayX = -offset.x;
  const displayY = offset.y;

  return (
    <div className="w-full h-full p-2 overflow-y-auto text-xs text-gray-700 border-l">
      <div className="flex items-center justify-between p-2 font-semibold">
        <div className="flex flex-row items-center gap-2">
          <div>X: {displayX.toFixed(0)}</div>
          <div>Y: {displayY.toFixed(0)}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex flex-row justify-end gap-1 px-3 py-1 space-x-2 max-w-max h-max"
              variant={"outline"}>
              {zoom} <ChevronDown className="p-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="p-1 space-y-1 bg-white border rounded-lg shadow cursor-pointer w-max"
            align="end">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1"
                onClick={zoomIn}>
                <ZoomInIcon className="w-4 h-4" />
                <span>Zoom In</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1"
                onClick={zoomOut}>
                <ZoomOutIcon className="w-4 h-4" />
                <span>Zoom Out</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1"
                onClick={resetZoom}>
                <RotateCcw className="w-4 h-4" />
                <span>Reset Zoom</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="h-0.5 bg-gray-200 rounded-md" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1"
                onClick={resetPosition}>
                <RotateCcw className="w-4 h-4" />
                <span>Reset Position</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator className="h-0.5 bg-gray-200 rounded-md" />

      {/* Node Property */}
      {node && !edge && (
        <div className="p-2 space-y-2">
          <h2 className="font-semibold">Properti Node</h2>
          <div>
            <strong>ID:</strong> {node.id}
          </div>
          <div>
            <strong>Tipe:</strong> {node.type}
          </div>
          <div>
            <strong>Label:</strong>{" "}
            {typeof node.data.label === "string" ? node.data.label : "Custom"}
          </div>
          <div>
            <strong>Posisi:</strong> X: {node.position.x.toFixed(2)}, Y:{" "}
            {node.position.y.toFixed(2)}
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              removeNode(node.id);
              onClearSelection();
            }}>
            Hapus Node
          </Button>
        </div>
      )}

      {/* Edge Property */}
      {!node && edge && (
        <div className="p-2 space-y-2">
          <h2 className="font-semibold">Properti Edge</h2>
          <div>
            <strong>ID:</strong> {edge.id}
          </div>
          <div>
            <strong>Source:</strong> {edge.sourceId}
          </div>
          <div>
            <strong>Target:</strong> {edge.targetId}
          </div>
          <div>
            <strong>Source Pos:</strong> {edge.sourcePosition}
          </div>
          <div>
            <strong>Target Pos:</strong> {edge.targetPosition}
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              removeEdge(edge.id);
              onClearSelection();
            }}>
            Hapus Edge
          </Button>
        </div>
      )}
    </div>
  );
};
