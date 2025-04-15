import type React from "react";
import useGlobalStore from "@/store/globals";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

export const PositionDock: React.FC = () => {
  const { offset, setOffset } = useGlobalStore();

  const resetPosition = () => {
    setOffset(0, 0);
  };

  const displayX = -offset.x;
  const displayY = offset.y;

  return (
    <div className="fixed flex items-center justify-center p-2 space-x-2 bg-gray-100 rounded-lg shadow bottom-4 left-4">
      <div>
        X: {displayX.toFixed(0)}, Y: {displayY.toFixed(0)}
      </div>
      <Button
        className="p-2 border rounded"
        onClick={resetPosition}
        variant={"ghost"}
        size={"icon"}>
        <RotateCcw />
      </Button>
    </div>
  );
};
