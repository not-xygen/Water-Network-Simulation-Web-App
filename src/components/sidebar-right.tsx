/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ChevronDown, RotateCcw, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import {
  formatElapsedTime,
  formatFlowRate,
  formatLengthCm,
  formatPressure,
} from "@/lib/utils";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";
import {
  startSimulation,
  stopSimulation,
  resetSimulation,
} from "@/handlers/use-simulation-engine-handler";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { Input } from "./ui/input";

import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

const renderEditableProperty = <T,>(
  key: string,
  value: T,
  onChange: (value: T) => void,
) => {
  if (key === "status") {
    return (
      <div className="flex justify-between">
        <Switch
          id="node-active"
          onCheckedChange={(checked) =>
            onChange((checked ? "open" : "close") as T)
          }
          className="h-4"
        />
      </div>
    );
  }

  if (key === "note") {
    return (
      <Textarea
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
      />
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

const renderEditableProperties = <T extends object>(
  obj: T,
  exclude: string[],
  update: <K extends keyof T>(key: K, value: T[K]) => void,
) => {
  return Object.entries(obj)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => {
      const isNote = key === "note";

      return (
        <div
          key={key}
          className={`flex ${
            isNote ? "flex-col" : "items-center justify-between"
          } gap-2`}>
          <span className="capitalize">{key}</span>
          {renderEditableProperty(key, value, (v) => update(key as keyof T, v))}
        </div>
      );
    });
};

const renderReadonlyProperties = <T extends object>(
  obj: T,
  exclude: string[] = [],
) => {
  return Object.entries(obj)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => {
      let displayValue = String(value);

      if (key === "elevation" && typeof value === "number") {
        displayValue = `${value.toFixed()} m`;
      }

      if (key === "head" && typeof value === "number") {
        displayValue = `${value.toFixed()} m`;
      }

      if (key === "diameter" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} cm`;
      }

      if (key === "roughness" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} cm`;
      }

      if (key === "flowRate" && typeof value === "number") {
        displayValue = formatFlowRate(value);
      }

      if (key === "pressure" && typeof value === "number") {
        displayValue = formatPressure(value);
      }

      const isNote = key === "note";

      return (
        <div
          key={key}
          className={`flex ${
            isNote ? "flex-col gap-1" : "items-center justify-between gap-2"
          }`}>
          <span className="capitalize">{key}</span>
          <span className="font-mono">{displayValue}</span>
        </div>
      );
    });
};

export const SidebarRight = () => {
  const { zoom, resetZoom, zoomIn, zoomOut, offset, setOffset } =
    useGlobalStore();
  const { nodes, selectedNodes, removeNode, edges, selectedEdges, removeEdge } =
    useNodeEdgeStore();

  const running = useSimulationStore((s) => s.running);
  const paused = useSimulationStore((s) => s.paused);
  const elapsedTime = useSimulationStore((s) => s.elapsedTime);

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

  const liveSelectedNodes = selectedNodes.map(
    (selected) => nodes.find((n) => n.id === selected.id) ?? selected,
  );

  const liveSelectedEdges = selectedEdges.map(
    (selected) => edges.find((n) => n.id === selected.id) ?? selected,
  );

  return (
    <div className="w-full h-full p-2 overflow-y-auto text-xs text-gray-700 border-l">
      <div className="flex items-center justify-between p-2 font-semibold">
        <div className="flex gap-2">
          <div>X: {displayX.toFixed(0)}</div>
          <div>Y: {displayY.toFixed(0)}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-1 px-3 py-1 text-xs md:text-xs h-max">
              {zoom} <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            align="end"
            className="p-1 space-y-1 bg-white border rounded-lg shadow">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem onClick={zoomIn} className="text-xs md:text-xs">
                <ZoomInIcon className="w-3 h-3 mr-2" /> Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={zoomOut}
                className="text-xs md:text-xs">
                <ZoomOutIcon className="w-3 h-3 mr-2" /> Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={resetZoom}
                className="text-xs md:text-xs">
                <RotateCcw className="w-3 h-3 mr-2" /> Reset Zoom
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={resetPosition}
                className="text-xs md:text-xs">
                <RotateCcw className="w-3 h-3 mr-2" /> Reset Position
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="h-0.5 bg-gray-200 rounded-md" />
      <Tabs defaultValue="editor" className="w-full mt-3">
        <TabsList className="w-full">
          <TabsTrigger
            className="w-full"
            value="editor"
            onClick={() => {
              stopSimulation();
            }}>
            Editor
          </TabsTrigger>
          <TabsTrigger className="w-full" value="simulation" onClick={() => {}}>
            Simulasi
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          {/* Node Properties */}
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
                      <span className="capitalize">
                        {selectedNodes[0].subtype}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between">
                  <span>Posisi</span>
                  <span>
                    X: {liveSelectedNodes[0].position.x.toFixed(2)}, Y:{" "}
                    {-liveSelectedNodes[0].position.y.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rotasi</span>
                  <span>{liveSelectedNodes[0].rotation.toFixed()}</span>
                </div>
                <div className="flex justify-between">
                  <label htmlFor="node-active">Aktif</label>
                  <Switch
                    id="node-active"
                    checked={liveSelectedNodes[0].active}
                    onCheckedChange={(checked) =>
                      updateNodeProperty("active", checked)
                    }
                    className="h-4"
                  />
                </div>
              </div>

              <Separator className="h-0.5 bg-gray-200 rounded-md" />

              <div className="space-y-1">
                {renderEditableProperties(
                  selectedNodes[0],
                  [
                    "id",
                    "type",
                    "subtype",
                    "position",
                    "rotation",
                    "active",
                    "flowRate",
                    "pressure",
                  ],
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
          {/* Edge Properties */}
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
                <div className="flex justify-between">
                  <span>Panjang</span>
                  <span>{formatLengthCm(liveSelectedEdges[0].length)}</span>
                </div>
              </div>

              <Separator className="h-0.5 bg-gray-200 rounded-md" />

              <div className="space-y-1">
                {renderEditableProperties(
                  selectedEdges[0],
                  [
                    "id",
                    "sourceId",
                    "targetId",
                    "sourcePosition",
                    "targetPosition",
                    "status",
                    "length",
                    "flowRate",
                    "pressure",
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
        </TabsContent>
        <TabsContent value="simulation">
          <div className="p-2 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  running ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-xs font-semibold">
                {running ? "Berjalan" : "Berhenti"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Waktu:</span>
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>

            <Separator className="h-0.5 bg-gray-200 rounded-md" />

            <div className="flex flex-col gap-2">
              {!running && !paused && (
                <Button onClick={startSimulation} className="w-full">
                  Mulai Simulasi
                </Button>
              )}

              {running && (
                <Button
                  onClick={stopSimulation}
                  className="w-full"
                  variant="secondary">
                  Berhenti
                </Button>
              )}

              {!running && paused && (
                <>
                  <Button onClick={startSimulation} className="w-full">
                    Lanjutkan Simulasi
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        Reset Simulasi
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Simulasi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data simulasi akan direset ke awal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={resetSimulation}>
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>

            {/* Node Properties */}
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
                    <span className="capitalize ">{selectedNodes[0].type}</span>
                  </div>
                  {selectedNodes[0].subtype &&
                    selectedNodes[0].subtype.length > 0 && (
                      <div className="flex justify-between">
                        <span>Sub-tipe</span>
                        <span className="capitalize">
                          {selectedNodes[0].subtype}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span>Posisi</span>
                    <span>
                      X: {liveSelectedNodes[0].position.x.toFixed(2)}, Y:{" "}
                      {-liveSelectedNodes[0].position.y.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotasi</span>
                    <span>{liveSelectedNodes[0].rotation.toFixed()}</span>
                  </div>
                  <div className="flex justify-between">
                    <label htmlFor="node-active">Aktif</label>
                    <Switch
                      disabled
                      id="node-active"
                      checked={liveSelectedNodes[0].active === true}
                      className="h-4"
                    />
                  </div>
                </div>

                <Separator className="h-0.5 bg-gray-200 rounded-md" />

                <div className="space-y-1">
                  {renderReadonlyProperties(liveSelectedNodes[0], [
                    "id",
                    "type",
                    "subtype",
                    "position",
                    "rotation",
                    "active",
                  ])}
                </div>
              </div>
            )}

            {/* Edge Properties */}
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
                  {renderReadonlyProperties(liveSelectedEdges[0], [
                    "id",
                    "sourceId",
                    "targetId",
                    "sourcePosition",
                    "targetPosition",
                    "status",
                  ])}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
