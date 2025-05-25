import { formatElapsedTime } from "@/lib/utils";
import { AlertDialogAction } from "../alert-dialog-action";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface SimulationControlsProps {
	running: boolean;
	paused: boolean;
	elapsedTime: number;
	onStart: () => void;
	onStop: () => void;
	onReset: () => void;
}

export const SimulationControls = ({
	running,
	paused,
	elapsedTime,
	onStart,
	onStop,
	onReset,
}: SimulationControlsProps) => {
	return (
		<div className="p-2 space-y-3">
			<div className="flex items-center gap-2">
				<div
					className={`w-3 h-3 rounded-full ${
						running ? "bg-green-500" : "bg-gray-400"
					}`}
				/>
				<span className="text-xs font-semibold">
					{running ? "Running" : "Stopped"}
				</span>
			</div>
			<div className="flex items-center justify-between text-xs">
				<span className="font-semibold">Elapsed Time:</span>
				<span>{formatElapsedTime(elapsedTime)}</span>
			</div>

			<Separator className="h-0.5 bg-gray-200 rounded-md" />

			<div className="flex flex-col gap-2">
				{!running && !paused && (
					<Button onClick={onStart} className="w-full">
						Start Simulation
					</Button>
				)}

				{running && (
					<Button onClick={onStop} className="w-full" variant="secondary">
						Stop Simulation
					</Button>
				)}

				{!running && paused && (
					<>
						<Button onClick={onStart} className="w-full">
							Continue Simulation
						</Button>

						<AlertDialogAction
							trigger={
								<Button className="w-full" variant="destructive">
									Reset Simulation
								</Button>
							}
							title="Reset Simulation?"
							description="Resetting the simulation will restore all nodes and edges to their default properties. This action cannot be undone."
							actionText="Reset"
							onAction={onReset}
						/>
					</>
				)}
			</div>
		</div>
	);
};
