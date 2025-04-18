import type React from "react";
import useGlobalStore from "../store/globals";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";

export const DockZoomTools: React.FC = () => {
  const zoom = useGlobalStore((state) => state.zoom);
  const zoomIn = useGlobalStore((state) => state.zoomIn);
  const zoomOut = useGlobalStore((state) => state.zoomOut);

  return (
    <div className="fixed z-50 flex items-center p-2 space-x-2 bg-gray-100 rounded-lg shadow bottom-4 right-4">
      <Button
        className="p-2 rounded "
        onClick={zoomOut}
        variant={"ghost"}
        size={"icon"}>
        <Minus />
      </Button>
      <span className="w-12 text-center">{zoom}%</span>
      <Button
        className="p-2 rounded"
        onClick={zoomIn}
        variant={"ghost"}
        size={"icon"}>
        <Plus />
      </Button>
    </div>
  );
};
