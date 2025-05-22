import { useHandlePosition } from "@/hooks/use-position";
import { useBoardEvents } from "@/hooks/useBoardEvents";
import useNodeEdgeStore from "@/store/node-edge";
import type { Edge } from "@/types/node-edge";
import { BoardCanvas } from "./board/board-canvas";
import { BoardGrid } from "./board/board-grid";
import { NodeItem } from "./node/node-item";

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

	return (
		<div
			id="board"
			className="relative z-40 w-full h-full overflow-hidden bg-gray-100"
			onWheel={handleBoardMouseWheel}
			onMouseDown={handleBoardMouseDown}
			onMouseUp={handleBoardMouseUp}
			onMouseLeave={handleBoardMouseUp}
			onMouseMove={handleBoardMouseMove}
		>
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
						}}
					>
						<NodeItem
							node={node}
							zoom={zoom}
							isSelected={selectedNodes.some((n) => n.id === node.id)}
							isDragged={draggedNode === node.id}
							onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
							onMouseUp={handleBoardMouseUp}
							onStartConnect={(e, pos) =>
								handleConnectionStart(e, node.id, pos)
							}
							onEndConnect={(e, pos) => handleConnectionEnd(e, node.id, pos)}
							onRotateStart={(e) => handleNodeStartRotate(e, node.id)}
							onRotateEnd={handleBoardMouseUp}
						/>
					</div>
				);
			})}
		</div>
	);
};
