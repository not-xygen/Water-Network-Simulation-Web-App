import { ChevronDown, RotateCcw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "../ui/dropdown";
import { Separator } from "../ui/separator";

interface ViewControlsProps {
	zoom: number;
	displayX: number;
	displayY: number;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
	resetPosition: () => void;
}

export const ViewControls = ({
	zoom,
	displayX,
	displayY,
	zoomIn,
	zoomOut,
	resetZoom,
	resetPosition,
}: ViewControlsProps) => {
	return (
		<>
			<div className="flex items-center justify-between p-2 font-semibold">
				<div className="flex gap-2">
					<div>X: {displayX.toFixed(0)}</div>
					<div>Y: {displayY.toFixed(0)}</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="flex gap-1 px-3 py-1 text-xs md:text-xs h-max"
						>
							{zoom} <ChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						onCloseAutoFocus={(e) => e.preventDefault()}
						align="end"
						className="p-1 space-y-1 bg-white border rounded-lg shadow w-[180px]"
					>
						<DropdownMenuGroup className="space-y-1">
							<DropdownMenuItem
								onClick={zoomIn}
								className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs"
							>
								<div className="flex items-center gap-2">
									<ZoomInIcon className="w-3 h-3" /> Zoom In
								</div>
								<DropdownMenuShortcut>Ctrl++</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={zoomOut}
								className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs"
							>
								<div className="flex items-center gap-2">
									<ZoomOutIcon className="w-3 h-3" /> Zoom Out
								</div>
								<DropdownMenuShortcut>Ctrl+-</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={resetZoom}
								className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs"
							>
								<div className="flex items-center gap-2">
									<RotateCcw className="w-3 h-3" /> Reset Zoom
								</div>
								<DropdownMenuShortcut>Ctrl+0</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={resetPosition}
								className="flex flex-row items-center justify-between gap-2 p-1 text-xs md:text-xs"
							>
								<div className="flex items-center gap-2">
									<RotateCcw className="w-3 h-3" /> Reset Position
								</div>
								<DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Separator className="h-0.5 bg-gray-200 rounded-md" />
		</>
	);
};
