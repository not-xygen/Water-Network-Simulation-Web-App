import type { Node, Edge } from "@/store/node-edge";
import useNodeEdgeStore from "@/store/node-edge";
import { Button } from "./ui/button";

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
  const { removeNode, removeEdge } = useNodeEdgeStore();

  if (!node && !edge)
    return (
      <div className="p-4">Pilih node atau edge untuk melihat properti</div>
    );

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto border-l">
      {/* Node Property */}
      {node && (
        <div className="space-y-2 text-sm">
          <h2 className="text-base font-semibold">Properti Node</h2>
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
      {edge && (
        <div className="space-y-2 text-sm">
          <h2 className="text-base font-semibold">Properti Edge</h2>
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
