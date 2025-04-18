/* eslint-disable no-unused-vars */
import useNodeEdgeStore from "@/store/node-edge";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import type { Node } from "@/store/node-edge";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  node: Node | null;
};

export const NodePropertyDrawer = ({ open, onOpenChange, node }: Props) => {
  const { removeNode } = useNodeEdgeStore();

  if (!node) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="right-0 w-full h-screen p-4 sm:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Properti Node</DrawerTitle>
          <DrawerDescription>Detail node yang dipilih</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-2">
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
        </div>

        <hr className="my-4 border-t" />

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            removeNode(node.id);
            onOpenChange(false);
          }}>
          Hapus Node
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
