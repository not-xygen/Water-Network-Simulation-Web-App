/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ConnectionHandles } from "./connection-handles";

interface TankNodeProps {
	isSelected: boolean;
	nodeId: string;
	onStartConnect: (
		e: React.MouseEvent,
		position: "left" | "right" | "top" | "bottom",
	) => void;
	onEndConnect: (
		e: React.MouseEvent,
		position: "left" | "right" | "top" | "bottom",
	) => void;
	rotation: number;
}

export const TankNode = ({
	isSelected,
	nodeId,
	onStartConnect,
	onEndConnect,
	rotation,
}: TankNodeProps) => {
	return (
		<div className="relative w-16 h-16">
			<div
				className={cn(
					"flex items-center justify-center w-16 h-16 font-bold text-black bg-orange-500 rounded-md",
					isSelected && "ring-2 ring-blue-500",
				)}
			>
				<img
					src="/assets/tank.svg"
					alt="Tank"
					className="w-8 h-8 pointer-events-none select-none"
					draggable={false}
					style={{ transform: `rotate(-${rotation}deg)` }}
				/>
			</div>
			<ConnectionHandles
				nodeId={nodeId}
				onStartConnect={onStartConnect}
				onEndConnect={onEndConnect}
				positions={["left", "right"]}
			/>
		</div>
	);
};
