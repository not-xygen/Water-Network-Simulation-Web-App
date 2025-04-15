import useGlobalStore from "@/store/globals";
import { Circle, Hammer, PenTool, Square } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const tools = [
	{ id: "pipe", name: "Pipe Tools", icon: <Hammer /> },
	{ id: "junction", name: "Junction Tools", icon: <PenTool /> },
	{ id: "circle", name: "Circle", icon: <Circle /> },
	{ id: "square", name: "Square", icon: <Square /> },
];

export const ToolsDock: React.FC = () => {
	const addNode = useGlobalStore((state) => state.addNode);
	const offset = useGlobalStore((state) => state.offset);

	const handleAddNode = useCallback(
		(type: string) => {
			const zoom = useGlobalStore.getState().zoom; // Ambil zoom dari store
			const viewportCenterX = window.innerWidth / 2; // Pusat viewport secara horizontal
			const viewportCenterY = window.innerHeight / 2; // Pusat viewport secara vertikal

			const newNode = {
				id: `${type}-${Date.now()}`, // Unique ID
				x: (viewportCenterX - offset.x) / (zoom / 100), // Hitung posisi absolut X
				y: (viewportCenterY - offset.y) / (zoom / 100), // Hitung posisi absolut Y
				type,
			};

			console.log("Adding node:", newNode);
			addNode(newNode);
		},
		[addNode, offset],
	);

	return (
		<div className="fixed flex flex-row p-2 space-x-2 transform -translate-x-1/2 bg-gray-100 shadow top-4 left-1/2 rounded-xl">
			{tools.map((tool) => (
				<Button
					key={tool.id}
					variant={"outline"}
					size={"icon"}
					onClick={() => handleAddNode(tool.id)}
				>
					{tool.icon}
				</Button>
			))}
			<Separator className="h-10 w-[2px] bg-gray-600 rounded" />
			<Button variant={"outline"} size={"icon"}>
				<Square />
			</Button>
		</div>
	);
};
