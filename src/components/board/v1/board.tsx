import { useBoardEvents } from "@/hooks/board/use-board-events";
import { useHandlePosition } from "@/hooks/use-position";
import useNodeEdgeStore from "@/store/node-edge";
import type { Edge } from "@/types/node-edge";
import html2canvas from "html2canvas";
import { CameraIcon } from "lucide-react";
import type { MouseEvent } from "react";
import NodeItem from "../../node/node-item";
import { BoardCanvas } from "./board-canvas";
import { BoardGrid } from "./board-grid";

type BoardProps = {
  isSpacePressed: boolean;
};

export const Board = ({ isSpacePressed }: BoardProps) => {
  const { nodes, edges, setSelectedEdges, setSelectedNodes, selectedNodes } =
    useNodeEdgeStore();
  const { getWorldToScreen } = useHandlePosition();

  const {
    zoom,
    offset,
    isDraggingBoardRef,
    connecting,
    mousePos,
    draggedNode,
    draggingEdgeHandle,
    selectionStart,
    selectionEnd,
    handleBoardMouseWheel,
    handleBoardMouseDown,
    handleBoardMouseUp,
    handleBoardMouseMove,
    handleNodeMouseDown,
    handleConnectionStart,
    handleConnectionEnd,
    handleNodeStartRotate,
    handleEdgeReconnection,
  } = useBoardEvents({ isSpacePressed });

  const captureBoardAsBlob = async (): Promise<Blob | null> => {
    try {
      const board = document.getElementById("board");
      if (!board) {
        return null;
      }

      const canvas = await html2canvas(board, {
        backgroundColor: null,
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      });
    } catch (err) {
      console.error("Error capturing board:", err);
      return null;
    }
  };

  const handleScreenshot = async () => {
    const blob = await captureBoardAsBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WNS-${
      new Date().toISOString().split("T")[0]
    }-board-screenshot.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="board"
      className="relative z-40 w-full h-full overflow-hidden bg-gray-100"
      onWheel={handleBoardMouseWheel}
      onMouseDown={handleBoardMouseDown}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      onMouseMove={handleBoardMouseMove}>
      <button
        type="button"
        onClick={handleScreenshot}
        className="absolute z-50 p-2 text-white bg-blue-500 rounded-full top-4 right-4 hover:bg-blue-600">
        <CameraIcon className="w-5 h-5" />
      </button>
      <BoardGrid
        zoom={zoom}
        offset={offset}
        isSpacePressed={isSpacePressed}
        isDragging={isDraggingBoardRef.current}
      />

      <BoardCanvas
        edges={edges}
        zoom={zoom}
        onEdgeClick={(edge: Edge) => {
          setSelectedEdges([edge]);
          setSelectedNodes([]);
        }}
        connecting={connecting}
        mousePos={mousePos}
        draggingEdgeHandle={draggingEdgeHandle}
        onEdgeReconnection={handleEdgeReconnection}
      />

      {nodes.map((node) => {
        const { x, y } = getWorldToScreen(node);
        return (
          <div
            key={node.id}
            className="absolute group z-[40] w-16 h-16"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}>
            <NodeItem
              node={node}
              zoom={zoom}
              isSelected={selectedNodes.some((n) => n.id === node.id)}
              isDragged={draggedNode === node.id}
              onMouseDown={(e: React.MouseEvent) =>
                handleNodeMouseDown(e, node.id)
              }
              onMouseUp={handleBoardMouseUp}
              onStartConnect={(
                e: React.MouseEvent,
                pos: "left" | "right" | "top" | "bottom",
              ) => handleConnectionStart(e, node.id, pos)}
              onEndConnect={(
                e: MouseEvent,
                pos: "left" | "right" | "top" | "bottom",
              ) => handleConnectionEnd(e, node.id, pos)}
              onRotateStart={(e: React.MouseEvent) =>
                handleNodeStartRotate(e, node.id)
              }
              onRotateEnd={handleBoardMouseUp}
            />
          </div>
        );
      })}

      {selectionStart && selectionEnd && (
        <div
          className="absolute border-2 pointer-events-none border-primary bg-primary/10"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
          }}
        />
      )}
    </div>
  );
};
