/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ChevronDown, RotateCcw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "./ui/dropdown";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";

const renderEditableProperty = <T,>(
  key: string,
  value: T,
  onChange: (value: T) => void,
) => {
  if (key === "status") {
    return (
      // biome-ignore lint/suspicious/noExplicitAny: <intended>
      <Select value={value as any} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="w-1/2 px-1 py-0.5 text-xs h-max md:text-xs">
          <SelectValue placeholder="Pilih Status" />
        </SelectTrigger>
        <SelectContent className="px-1 py-0.5">
          <SelectItem className="text-xs py-0.5 md:text-xs" value="open">
            Open
          </SelectItem>
          <SelectItem className="text-xs py-0.5 md:text-xs" value="close">
            Close
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (typeof value === "number") {
    return (
      <Input
        type="number"
        className="w-1/2 px-1 py-0.5 text-xs h-max md:text-xs"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
      />
    );
  }

  return (
    <Input
      type="text"
      className="w-1/2 px-1 py-0.5 text-xs h-max md:text-xs"
      // biome-ignore lint/suspicious/noExplicitAny: <intended>
      value={value as any}
      onChange={(e) => onChange(e.target.value as T)}
    />
  );
};

const renderObjectProperties = <T extends object>(
  obj: T,
  exclude: string[],
  update: <K extends keyof T>(key: K, value: T[K]) => void,
) => {
  return Object.entries(obj)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => (
      <div key={key} className="flex items-center justify-between gap-2">
        <span className="capitalize">{key}</span>
        {renderEditableProperty(key, value, (v) => update(key as keyof T, v))}
      </div>
    ));
};

export const SidebarRight = () => {
  const { zoom, resetZoom, zoomIn, zoomOut, offset, setOffset } =
    useGlobalStore();
  const { selectedNodes, selectedEdges, removeNode, removeEdge } =
    useNodeEdgeStore();

  const resetPosition = () => setOffset(0, 0);

  const displayX = -offset.x;
  const displayY = offset.y;

  // biome-ignore lint/suspicious/noExplicitAny: <intended>
  const updateNodeProperty = (key: string, value: any) => {
    const node = selectedNodes[0];
    if (!node) return;

    useNodeEdgeStore.setState((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === node.id ? { ...n, [key]: value } : n,
      ),
      selectedNodes: [{ ...node, [key]: value }],
    }));
  };

  // biome-ignore lint/suspicious/noExplicitAny: <intended>
  const updateEdgeProperty = (key: string, value: any) => {
    const edge = selectedEdges[0];
    if (!edge) return;

    useNodeEdgeStore.setState((state) => ({
      edges: state.edges.map((e) =>
        e.id === edge.id ? { ...e, [key]: value } : e,
      ),
      selectedEdges: [{ ...edge, [key]: value }],
    }));
  };

  return (
    <div className="w-full h-full p-2 overflow-y-auto text-xs text-gray-700 border-l">
      <div className="flex items-center justify-between p-2 font-semibold">
        <div className="flex gap-2">
          <div>X: {displayX.toFixed(0)}</div>
          <div>Y: {displayY.toFixed(0)}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-1 px-3 py-1">
              {zoom} <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="p-1 space-y-1 bg-white border rounded-lg shadow">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem onClick={zoomIn}>
                <ZoomInIcon className="w-4 h-4 mr-2" /> Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={zoomOut}>
                <ZoomOutIcon className="w-4 h-4 mr-2" /> Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetZoom}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Zoom
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={resetPosition}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Position
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator className="h-0.5 bg-gray-200 rounded-md" />

      {/* NODE PROPERTIES */}
      {selectedNodes.length > 0 && selectedEdges.length === 0 && (
        <div className="p-2 space-y-3">
          <h2 className="text-sm font-semibold">Properti Node</h2>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>ID</span>
              <span className="font-mono">{selectedNodes[0].id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipe</span>
              <span className="capitalize">{selectedNodes[0].type}</span>
            </div>
            {selectedNodes[0].subtype &&
              selectedNodes[0].subtype.length > 0 && (
                <div className="flex justify-between">
                  <span>Sub-tipe</span>
                  <span className="capitalize">{selectedNodes[0].subtype}</span>
                </div>
              )}
            <div className="flex justify-between">
              <span>Posisi</span>
              <span>
                X: {selectedNodes[0].position.x.toFixed(2)}, Y:{" "}
                {selectedNodes[0].position.y.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator className="h-0.5 bg-gray-200 rounded-md" />

          <div className="space-y-1">
            {renderObjectProperties(
              selectedNodes[0],
              ["id", "type", "subtype", "position", "rotation"],
              updateNodeProperty,
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Hapus Node
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Node?</AlertDialogTitle>
                <AlertDialogDescription>
                  Node ini akan dihapus beserta koneksi terkait.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeNode(selectedNodes[0].id)}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* EDGE PROPERTIES */}
      {selectedEdges.length > 0 && selectedNodes.length === 0 && (
        <div className="p-2 space-y-3">
          <h2 className="text-sm font-semibold">Properti Edge</h2>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>ID</span>
              <span className="font-mono">{selectedEdges[0].id}</span>
            </div>
            <div className="flex justify-between">
              <span>Source</span>
              <span>{selectedEdges[0].sourceId}</span>
            </div>
            <div className="flex justify-between">
              <span>Target</span>
              <span>{selectedEdges[0].targetId}</span>
            </div>
          </div>

          <Separator className="h-0.5 bg-gray-200 rounded-md" />

          <div className="space-y-1">
            {renderObjectProperties(
              selectedEdges[0],
              [
                "id",
                "sourceId",
                "targetId",
                "sourcePosition",
                "targetPosition",
              ],
              updateEdgeProperty,
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Hapus Edge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Edge?</AlertDialogTitle>
                <AlertDialogDescription>
                  Edge ini akan dihapus dari koneksi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeEdge(selectedEdges[0].id)}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
