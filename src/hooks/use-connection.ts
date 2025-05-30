/* eslint-disable no-unused-vars */
import { useCallback } from "react";

import { createEdge } from "@/lib/node-edge-factory";
import useNodeEdgeStore from "@/store/node-edge";

export const useConnectionHandler = ({
	connecting,
	setConnecting,
	setMousePos,
	updateEdgeConnection,
	isConnectingRef,
	setDraggingEdgeHandle,
}: {
	connecting: {
		sourceId: string;
		sourcePosition: "left" | "right" | "top" | "bottom";
	} | null;
	setConnecting: (
		connecting: {
			sourceId: string;
			sourcePosition: "left" | "right" | "top" | "bottom";
		} | null,
	) => void;
	setMousePos: (pos: { x: number; y: number } | null) => void;
	updateEdgeConnection: (
		edgeId: string,
		args: {
			from: "source" | "target";
			newNodeId: string;
			newPosition: "left" | "right" | "top" | "bottom";
		},
	) => void;
	isConnectingRef: React.MutableRefObject<boolean>;
	setDraggingEdgeHandle: (
		handle: {
			edgeId: string;
			type: "source" | "target";
		} | null,
	) => void;
}) => {
	const { nodes, edges, addEdge } = useNodeEdgeStore();

	const handleConnectionStart = useCallback(
		(
			event: React.MouseEvent,
			nodeId: string,
			position: "left" | "right" | "top" | "bottom",
		) => {
			event.stopPropagation();

			const boardRect = document
				.getElementById("board")
				?.getBoundingClientRect();

			const startX = event.clientX - (boardRect?.left ?? 0);
			const startY = event.clientY - (boardRect?.top ?? 0);

			isConnectingRef.current = true;
			setConnecting({
				sourceId: nodeId,
				sourcePosition: position,
			});

			setMousePos({ x: startX, y: startY });

			const handleMouseMove = (e: globalThis.MouseEvent) => {
				const moveX = e.clientX - (boardRect?.left ?? 0);
				const moveY = e.clientY - (boardRect?.top ?? 0);
				setMousePos({ x: moveX, y: moveY });
			};

			const handleMouseUp = () => {
				isConnectingRef.current = false;
				setConnecting(null);
				setMousePos(null);
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
			};

			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		},
		[isConnectingRef, setConnecting, setMousePos],
	);

	const handleConnectionEnd = useCallback(
		(
			event: React.MouseEvent,
			nodeId: string,
			position: "left" | "right" | "top" | "bottom",
		) => {
			event.stopPropagation();

			if (!connecting || connecting.sourceId === nodeId) {
				setConnecting(null);
				setMousePos(null);
				return;
			}

			const edgeExists =
				edges?.some(
					(e) =>
						e.sourceId === connecting.sourceId &&
						e.targetId === nodeId &&
						e.sourcePosition === connecting.sourcePosition &&
						e.targetPosition === position,
				) ?? false;

			if (edgeExists) {
				console.warn(
					"Edge already exists, cannot create duplicate connection.",
				);
			} else {
				const sourceNode = nodes?.find((n) => n.id === connecting.sourceId);
				const targetNode = nodes?.find((n) => n.id === nodeId);

				if (!sourceNode || !targetNode) {
					console.warn("Node not found");
					setConnecting(null);
					setMousePos(null);
					return;
				}

				const dx = targetNode.position.x - sourceNode.position.x;
				const dy = targetNode.position.y - sourceNode.position.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				const newEdge = createEdge(
					connecting.sourceId,
					nodeId,
					connecting.sourcePosition,
					position,
					{
						length: Math.round(distance),
					},
				);

				addEdge(newEdge);
			}

			setConnecting(null);
			setMousePos(null);
		},
		[addEdge, connecting, edges, nodes, setConnecting, setMousePos],
	);

	const handleEdgeReconnection = useCallback(
		(e: React.MouseEvent, edgeId: string, from: "source" | "target") => {
			e.stopPropagation();
			e.preventDefault();

			const boardRect = document
				.getElementById("board")
				?.getBoundingClientRect();

			const startX = e.clientX - (boardRect?.left ?? 0);
			const startY = e.clientY - (boardRect?.top ?? 0);

			setDraggingEdgeHandle({ edgeId, type: from });
			setMousePos({ x: startX, y: startY });

			const handleMouseMove = (e: globalThis.MouseEvent) => {
				const moveX = e.clientX - (boardRect?.left ?? 0);
				const moveY = e.clientY - (boardRect?.top ?? 0);
				setMousePos({ x: moveX, y: moveY });
			};

			const handleMouseUp = (e: globalThis.MouseEvent) => {
				const target = document.elementFromPoint(e.clientX, e.clientY);
				const handle = target?.closest("[data-handle]") as HTMLElement | null;

				const targetId = handle?.getAttribute("data-node-id");
				const pos = handle?.getAttribute("data-position") as
					| "left"
					| "right"
					| "top"
					| "bottom";

				if (handle && targetId) {
					const edge = edges.find((e) => e.id === edgeId);
					if (!edge) return;

					const isSameNode =
						from === "source"
							? targetId === edge.targetId
							: targetId === edge.sourceId;

					if (isSameNode) {
						console.warn("Cannot connect to the same node");
					} else {
						updateEdgeConnection(edgeId, {
							from,
							newNodeId: targetId,
							newPosition: pos,
						});
					}
				}

				setDraggingEdgeHandle(null);
				setMousePos(null);
				window.removeEventListener("pointermove", handleMouseMove);
				window.removeEventListener("pointerup", handleMouseUp);
			};

			window.addEventListener("pointermove", handleMouseMove);
			window.addEventListener("pointerup", handleMouseUp);
		},
		[setDraggingEdgeHandle, setMousePos, updateEdgeConnection, edges],
	);

	return {
		handleConnectionStart,
		handleConnectionEnd,
		handleEdgeReconnection,
	};
};
