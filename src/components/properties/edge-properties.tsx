/* eslint-disable no-unused-vars */
import { PIXEL_TO_CM } from "@/constant/globals";
import type { Edge } from "@/types/node-edge";
import { ActionAlertDialog } from "../action-alert-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
	renderEditableProperties,
	renderReadonlyProperties,
} from "./property-renderers";

interface EdgePropertiesProps {
	edge: Edge;
	liveEdge: Edge;
	onUpdateProperty: (key: keyof Edge, value: Edge[keyof Edge]) => void;
	onDelete: (id: string) => void;
	isSimulation?: boolean;
}

export const EdgeProperties = ({
	edge,
	liveEdge,
	onUpdateProperty,
	onDelete,
	isSimulation = false,
}: EdgePropertiesProps) => {
	return (
		<div className="p-2 space-y-3">
			<h2 className="text-sm font-semibold">Edge Property</h2>
			<div className="space-y-1">
				<div className="flex justify-between">
					<span className="w-1/2">ID</span>
					<span className="w-1/2 font-mono">{edge.id}</span>
				</div>
				<div className="flex justify-between">
					<span className="w-1/2">Source</span>
					<span className="w-1/2">{edge.sourceId}</span>
				</div>
				<div className="flex justify-between">
					<span className="w-1/2">Target</span>
					<span className="w-1/2">{edge.targetId}</span>
				</div>
				{!isSimulation && (
					<div className="flex justify-between">
						<span className="w-1/2">Length</span>
						<span className="w-1/2">
							{(liveEdge.length * PIXEL_TO_CM).toFixed(1)}
						</span>
					</div>
				)}
			</div>

			<Separator className="h-0.5 bg-gray-200 rounded-md" />

			<div className="space-y-1">
				{isSimulation
					? renderReadonlyProperties(liveEdge, [
							"id",
							"sourceId",
							"targetId",
							"sourcePosition",
							"targetPosition",
							"status",
						])
					: renderEditableProperties(
							edge,
							[
								"id",
								"sourceId",
								"targetId",
								"sourcePosition",
								"targetPosition",
								"status",
								"length",
								"flowRate",
								"pressure",
								"velocity",
							],
							onUpdateProperty,
						)}
			</div>

			{!isSimulation && (
				<ActionAlertDialog
					trigger={
						<Button variant="destructive" className="w-full">
							Delete Edge
						</Button>
					}
					title="Delete Edge?"
					description="Edge will be removed from the board. This action cannot be undone."
					actionText="Delete"
					onAction={() => onDelete(edge.id)}
				/>
			)}
		</div>
	);
};
