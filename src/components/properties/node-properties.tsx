/* eslint-disable no-unused-vars */
import type { Node, ValveNode } from "@/types/node-edge";

import { AlertDialogAction } from "../dialog/alert-dialog-action";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  renderEditableProperties,
  renderReadonlyProperties,
} from "./property-renderers";
import { VALVE_STATUS_OPTIONS } from "@/constant/globals";

interface NodePropertiesProps {
  node: Node;
  liveNode: Node;
  onUpdateProperty: (key: keyof Node, value: Node[keyof Node]) => void;
  onDelete: (id: string) => void;
  isSimulation?: boolean;
}

export const NodeProperties = ({
  node,
  liveNode,
  onUpdateProperty,
  onDelete,
  isSimulation = false,
}: NodePropertiesProps) => {
  return (
    <div className="p-2 space-y-3">
      <h2 className="text-sm font-semibold">Node Property</h2>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="w-1/2">ID</span>
          <span className="w-1/2 font-mono">{node.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="w-1/2">Type</span>
          <span className="w-1/2 capitalize">{node.type}</span>
        </div>
        {node.subtype && node.subtype.length > 0 && (
          <div className="flex justify-between">
            <span className="w-1/2">Sub-type</span>
            <span className="w-1/2 capitalize">{node.subtype}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="w-1/2">Position</span>
          <span className="w-1/2">
            X: {liveNode.position.x.toFixed(2)}, Y:{" "}
            {-liveNode.position.y.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="w-1/2">Rotation</span>
          <span className="w-1/2">{liveNode.rotation.toFixed()}</span>
        </div>
        <div className="flex justify-between">
          <label htmlFor="node-active" className="w-1/2">
            Active
          </label>
          <div className="w-1/2">
            <Switch
              id="node-active"
              checked={liveNode.active}
              onCheckedChange={(checked) => onUpdateProperty("active", checked)}
              className="h-4"
            />
          </div>
        </div>
        {liveNode.type === "valve" && (
          <div className="flex justify-between items-center">
            <span className="w-1/2">Status</span>
            <div className="w-1/2">
              <Select
                value={(liveNode as ValveNode).status}
                onValueChange={(value) =>
                  onUpdateProperty("status" as keyof Node, value)
                }>
                <SelectTrigger className="py-0.5 text-xs w-max h-max">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {VALVE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Separator className="h-0.5 bg-gray-200 rounded-md" />

      <div className="space-y-1">
        {isSimulation
          ? renderReadonlyProperties(liveNode, [
              "id",
              "type",
              "subtype",
              "position",
              "rotation",
              "active",
              "note",
              ...(node.type === "reservoir"
                ? ["flowRate"]
                : node.type === "valve"
                ? ["status"]
                : node.type === "pump"
                ? []
                : node.type === "fitting"
                ? []
                : []),
            ])
          : renderEditableProperties(
              node,
              [
                "id",
                "type",
                "subtype",
                "position",
                "rotation",
                "active",
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
              onUpdateProperty,
            )}
        {!isSimulation && (
          <div className="space-y-1">
            <span className="capitalize">Note</span>
            <Textarea
              value={node.note}
              onChange={(e) => onUpdateProperty("note", e.target.value)}
              className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
            />
          </div>
        )}
        {isSimulation && (
          <div>
            <span>Note</span>
            <p>{node.note}</p>
          </div>
        )}
      </div>

      {!isSimulation && (
        <AlertDialogAction
          trigger={
            <Button variant="destructive" className="w-full">
              Delete Node
            </Button>
          }
          title="Delete Node?"
          description="Node will be removed from the board. This action cannot be undone."
          actionText="Delete"
          onAction={() => onDelete(node.id)}
        />
      )}
    </div>
  );
};
