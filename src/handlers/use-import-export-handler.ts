import useNodeEdgeStore from "@/store/node-edge";

export const useImportExportHandler = () => {
  const { nodes, edges } = useNodeEdgeStore();

  const exportData = () => {
    const data = {
      nodes: nodes,
      edges: edges,
    };
    const textFile = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(textFile);
    element.download = "data.json";
  };

  const importData = () => {
    return console.log("import");
  };

  return { exportData, importData };
};
