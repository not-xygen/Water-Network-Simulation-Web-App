/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ChevronDown, RotateCcw, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import {
  resetSimulation,
  startSimulation,
  stopSimulation,
} from "@/handlers/use-engine-v4-handler";
import { formatElapsedTime } from "@/lib/utils";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { Input } from "./ui/input";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PIXEL_TO_CM } from "@/constant/globals";
import { ActionAlertDialog } from "./action-alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
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
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return (
        <div
          key={key}
          className={`flex ${
            isNote ? "flex-col" : "items-center justify-between"
          } gap-2 w-full`}>
          <span className="w-full flex gap-0.5 capitalize">
            {label}
            {key === "diameter" || key === "height" ? (
              <span className="font-mono text-xs text-gray-400 lowercase">
                (cm)
              </span>
            ) : null}
          </span>
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
      let displayValue: React.ReactNode = String(value);

      if (
        (key === "elevation" || key === "head") &&
        typeof value === "number"
      ) {
        displayValue = `${value.toFixed()} m`;
      }

      if (key === "length" && typeof value === "number") {
        displayValue = `${(value * PIXEL_TO_CM).toFixed(1)} cm`;
      }

      if (
        (key === "diameter" || key === "height") &&
        typeof value === "number"
      ) {
        displayValue = `${value} cm`;
      }

      if (key === "flowRate" && typeof value === "number") {
        displayValue = `${Math.abs(value).toFixed(4)} L/s`;
      }

      if (
        (key === "pressure" ||
          key === "inletPressure" ||
          key === "outletPressure") &&
        typeof value === "number"
      ) {
        displayValue = `${value.toFixed(4)} bar`;
      }

      if (key === "currentVolume" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} L`;
      }

      if (key === "currentVolumeHeight" && typeof value === "number") {
        displayValue = `${value.toFixed(4)} m`;
      }

      if (key === "maxVolume" && typeof value === "number") {
        displayValue = `${value.toFixed()} L`;
      }

      if (key === "filledPercentage" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} %`;
      }

      if (
        (key === "minorLossCoefficient" || key === "roughness") &&
        typeof value === "number"
      ) {
        displayValue = `${value} C`;
      }

      if (key === "velocity" && typeof value === "number") {
        displayValue = `${value.toFixed(4)} m/s`;
      }

      if (key === "suctionHeadMax" && typeof value === "number") {
        displayValue = `${value} m`;
      }

      if (key === "totalHeadMax" && typeof value === "number") {
        displayValue = `${value} m`;
      }

      if (key === "capacityMax" && typeof value === "number") {
        displayValue = `${value} L/min`;
      }

      if (key === "suctionPipeDiameter" && typeof value === "number") {
        displayValue = `${value} cm`;
      }

      if (key === "dischargePipeDiameter" && typeof value === "number") {
        displayValue = `${value} cm`;
      }

      if (key === "curveHead" && Array.isArray(value)) {
        // biome-ignore lint/suspicious/noExplicitAny: <intended>
        const curveFlow = (obj as Record<string, any>).curveFlow;
        displayValue = (
          <ul className="ml-2">
            {value.map((h, i) => (
              <li key={`curve-${i + 1}`}>{`H: ${h} m, Q: ${
                curveFlow?.[i] ?? "-"
              } L/min`}</li>
            ))}
          </ul>
        );
      }

      return (
        <div key={key} className={"flex items-center justify-between gap-2"}>
          <span className="capitalize">{key}</span>
          <div className="font-mono">{displayValue}</div>
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
            className="p-1 space-y-1 bg-white border rounded-lg shadow w-[180px]">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                onClick={zoomIn}
                className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs">
                <div className="flex items-center gap-2">
                  <ZoomInIcon className="w-3 h-3" /> Zoom In
                </div>
                <DropdownMenuShortcut>Ctrl++</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={zoomOut}
                className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs">
                <div className="flex items-center gap-2">
                  <ZoomOutIcon className="w-3 h-3" /> Zoom Out
                </div>
                <DropdownMenuShortcut>Ctrl+-</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={resetZoom}
                className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3 h-3" /> Reset Zoom
                </div>
                <DropdownMenuShortcut>Ctrl+0</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={resetPosition}
                className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3 h-3" /> Reset Position
                </div>
                <DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
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
            Simulation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          {/* Node Properties */}
          {selectedNodes.length > 0 && selectedEdges.length === 0 && (
            <div className="p-2 space-y-3">
              <h2 className="text-sm font-semibold">Node Property</h2>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono">{selectedNodes[0].id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="capitalize">{selectedNodes[0].type}</span>
                </div>
                {selectedNodes[0].subtype &&
                  selectedNodes[0].subtype.length > 0 && (
                    <div className="flex justify-between">
                      <span>Sub-type</span>
                      <span className="capitalize">
                        {selectedNodes[0].subtype}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between">
                  <span>Position</span>
                  <span>
                    X: {liveSelectedNodes[0].position.x.toFixed(2)}, Y:{" "}
                    {-liveSelectedNodes[0].position.y.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rotation</span>
                  <span>{liveSelectedNodes[0].rotation.toFixed()}</span>
                </div>
                <div className="flex justify-between">
                  <label htmlFor="node-active">Active</label>
                  <Switch
                    id="node-active"
                    checked={liveSelectedNodes[0].active}
                    onCheckedChange={(checked) =>
                      updateNodeProperty("active", checked)
                    }
                    className="h-4"
                  />
                </div>
                {liveSelectedNodes[0].type === "valve" && (
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Select
                      value={liveSelectedNodes[0].status}
                      onValueChange={(value) =>
                        updateNodeProperty("status", value)
                      }>
                      <SelectTrigger className="py-0.5 text-xs w-max h-max">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open" className="text-xs">
                          Open
                        </SelectItem>
                        <SelectItem value="close" className="text-xs">
                          Close
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    "pressure",
                    "flowRate",
                    "note",
                    "maxVolume",
                    "currentVolume",
                    "currentVolumeHeight",
                    "filledPercentage",
                    "status",
                    "velocity",
                    "inletPressure",
                    "outletPressure",
                    "demand",
                  ],
                  updateNodeProperty,
                )}
                <div className="space-y-1">
                  <span className="capitalize">Note</span>
                  <Textarea
                    value={selectedNodes[0].note}
                    onChange={(e) => updateNodeProperty("note", e.target.value)}
                    className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
                  />
                </div>
              </div>

              <ActionAlertDialog
                trigger={
                  <Button variant="destructive" className="w-full">
                    Delete Node
                  </Button>
                }
                title="Delete Node?"
                description="Node will be removed from the board. This action cannot be undone."
                actionText="Delete"
                onAction={() => removeNode(selectedNodes[0].id)}
              />
            </div>
          )}
          {/* Edge Properties */}
          {selectedEdges.length > 0 && selectedNodes.length === 0 && (
            <div className="p-2 space-y-3">
              <h2 className="text-sm font-semibold">Edge Property</h2>
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
                  <span>Length</span>
                  <span>
                    {(liveSelectedEdges[0].length * PIXEL_TO_CM).toFixed(1)}
                  </span>
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
                    "velocity",
                  ],
                  updateEdgeProperty,
                )}
              </div>

              <ActionAlertDialog
                trigger={
                  <Button variant="destructive" className="w-full">
                    Delete Edge
                  </Button>
                }
                title="Delete Edge?"
                description="Edge will be removed from the board. This action cannot be undone."
                actionText="Delete"
                onAction={() => removeEdge(selectedEdges[0].id)}
              />
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
                {running ? "Running" : "Stopped"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Elapsed Time:</span>
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>

            <Separator className="h-0.5 bg-gray-200 rounded-md" />

            <div className="flex flex-col gap-2">
              {!running && !paused && (
                <Button onClick={startSimulation} className="w-full">
                  Start Simulation
                </Button>
              )}

              {running && (
                <Button
                  onClick={stopSimulation}
                  className="w-full"
                  variant="secondary">
                  Stop Simulation
                </Button>
              )}

              {!running && paused && (
                <>
                  <Button onClick={startSimulation} className="w-full">
                    Continue Simulation
                  </Button>

                  <ActionAlertDialog
                    trigger={
                      <Button className="w-full" variant="destructive">
                        Reset Simulation
                      </Button>
                    }
                    title="Reset Simulation?"
                    description="Resetting the simulation will restore all nodes and edges to their default properties. This action cannot be undone."
                    actionText="Reset"
                    onAction={resetSimulation}
                  />
                </>
              )}
            </div>

            {/* Node Properties */}
            {selectedNodes.length > 0 && selectedEdges.length === 0 && (
              <div className="p-2 space-y-3">
                <h2 className="text-sm font-semibold">Node Property</h2>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>ID</span>
                    <span className="font-mono">{selectedNodes[0].id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="capitalize ">{selectedNodes[0].type}</span>
                  </div>
                  {selectedNodes[0].subtype &&
                    selectedNodes[0].subtype.length > 0 && (
                      <div className="flex justify-between">
                        <span>Sub-type</span>
                        <span className="capitalize">
                          {selectedNodes[0].subtype}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span>Position</span>
                    <span>
                      X: {liveSelectedNodes[0].position.x.toFixed(2)}, Y:{" "}
                      {-liveSelectedNodes[0].position.y.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotation</span>
                    <span>{liveSelectedNodes[0].rotation.toFixed()}</span>
                  </div>
                  <div className="flex justify-between">
                    <label htmlFor="node-active">Active</label>
                    <Switch
                      id="node-active"
                      checked={liveSelectedNodes[0].active === true}
                      onCheckedChange={(checked) =>
                        updateNodeProperty("active", checked)
                      }
                      className="h-4"
                    />
                  </div>
                  {liveSelectedNodes[0].type === "valve" && (
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Select
                        value={liveSelectedNodes[0].status}
                        onValueChange={(value) =>
                          updateNodeProperty("status", value)
                        }>
                        <SelectTrigger className="py-0.5 text-xs w-max h-max">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open" className="text-xs">
                            Open
                          </SelectItem>
                          <SelectItem value="close" className="text-xs">
                            Close
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                    "note",
                    ...(selectedNodes[0].type === "reservoir"
                      ? ["flowRate"]
                      : selectedNodes[0].type === "valve"
                      ? ["pressure", "status"]
                      : selectedNodes[0].type === "pump"
                      ? []
                      : selectedNodes[0].type === "fitting"
                      ? []
                      : []),
                  ])}
                  <div>
                    <span>Note</span>
                    <p>{selectedNodes[0].note}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Edge Properties */}
            {selectedEdges.length > 0 && selectedNodes.length === 0 && (
              <div className="p-2 space-y-3">
                <h2 className="text-sm font-semibold">Edge Property</h2>
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
