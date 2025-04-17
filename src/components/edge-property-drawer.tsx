/* eslint-disable no-unused-vars */
import type { Edge } from "@/store/node-edge";
import useNodeEdgeStore from "@/store/node-edge";

import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  edge: Edge | null;
};

export const EdgePropertyDrawer = ({ open, onOpenChange, edge }: Props) => {
  const { removeEdge } = useNodeEdgeStore();

  if (!edge) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="right-0 w-full h-screen p-4 sm:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Properti Edge</DrawerTitle>
          <DrawerDescription>Detail koneksi antar node</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-2 text-sm">
          <div>
            <strong>ID:</strong> {edge.id}
          </div>
          <div>
            <strong>Source:</strong> {edge.sourceId}
          </div>
          <div>
            <strong>Target:</strong> {edge.targetId}
          </div>
        </div>

        <hr className="my-4 border-t" />

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            removeEdge(edge.id);
            onOpenChange(false);
          }}>
          Hapus Edge
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
