import useGlobalStore from "@/store/globals";
import type React from "react";
import { useCallback, useRef } from "react";

export const BoardComponent: React.FC = () => {
	const { zoom, offset, setOffset, zoomIn, zoomOut, nodes } = useGlobalStore();

	const isDraggingRef = useRef(false);
	const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

	const handleWheel = useCallback(
		(event: React.WheelEvent) => {
			event.preventDefault();
			if (event.deltaY < 0) zoomIn();
			else zoomOut();
		},
		[zoomIn, zoomOut],
	);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		isDraggingRef.current = true;
		lastMousePosRef.current = { x: event.clientX, y: event.clientY };
	}, []);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = false;
		lastMousePosRef.current = null;
	}, []);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent) => {
			if (!isDraggingRef.current || !lastMousePosRef.current) return;

			const deltaX = event.clientX - lastMousePosRef.current.x; // Balik tanda untuk X
			const deltaY = lastMousePosRef.current.y - event.clientY; // Tetap untuk Y
			setOffset(offset.x + deltaX, offset.y - deltaY); // Sesuaikan tanda di sini

			lastMousePosRef.current = { x: event.clientX, y: event.clientY };
		},
		[offset.x, offset.y, setOffset],
	);

	return (
		<div
			className="w-screen h-screen overflow-hidden"
			onWheel={handleWheel}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseUp}
			style={{
				cursor: isDraggingRef.current ? "grabbing" : "grab",
			}}
		>
			<div
				className="absolute"
				style={{
					transform: `translate(-50%, -50%) translate(${offset.x}px, ${
						offset.y
					}px) scale(${zoom / 100})`,
					width: "50000px",
					height: "50000px",
					backgroundSize: "30px 30px",
					backgroundImage:
						"radial-gradient(circle, #b8b8b8bf 2px, transparent 1px)",
				}}
			>
				{nodes.map((node) => (
					<div
						key={node.id}
						className="absolute z-50 bg-blue-500 rounded-full"
						style={{
							left: `${node.x}px`, // Posisi absolut X
							top: `${node.y}px`, // Posisi absolut Y
							width: "20px",
							height: "20px",
						}}
					>
						{node.type}
					</div>
				))}
			</div>
		</div>
	);
};
