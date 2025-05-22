import { toast } from "@/hooks/use-toast";
import useNodeEdgeStore from "@/store/node-edge";

export const useImportExportHandler = () => {
	const { nodes, edges } = useNodeEdgeStore();

	const exportData = () => {
		if (nodes.length === 0 && edges.length === 0) {
			toast({
				title: "Export Failed",
				description: "Nothing to export. Please add nodes and edges first.",
				variant: "destructive",
			});
			return;
		}

		const data = {
			nodes: nodes,
			edges: edges,
		};
		const textFile = new Blob([JSON.stringify(data)], {
			type: "application/json",
		});
		const element = document.createElement("a");
		element.href = URL.createObjectURL(textFile);
		element.download = `WNS-${new Date().toLocaleDateString()}.json`;
		element.click();
		URL.revokeObjectURL(element.href);

		toast({
			title: "Export Successful",
			description: "Data has been exported to JSON file",
		});
	};

	const importData = (files: File[]) => {
		const file = files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target?.result as string);

				if (!data.nodes || !data.edges) {
					throw new Error("Invalid file format");
				}

				useNodeEdgeStore.setState({
					nodes: data.nodes,
					edges: data.edges,
					selectedNodes: [],
					selectedEdges: [],
				});

				toast({
					title: "Import Successful",
					description: "Data has been imported successfully",
				});
			} catch (error) {
				console.error("Error importing file:", error);
				toast({
					title: "Import Failed",
					description: "Invalid or corrupted file",
					variant: "destructive",
				});
			}
		};

		reader.readAsText(file);
	};

	return { exportData, importData };
};
