/* eslint-disable no-unused-vars */
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulationSave } from "@/hooks/use-save-load";
import { toast } from "@/hooks/use-toast";
import useNodeEdgeStore from "@/store/node-edge";
import type { SimulationSave } from "@/types/save-load";

type TabValue = "save" | "load";

const SLOTS_PER_PAGE = 8;

export function DialogSaveLoad({
  open,
  onOpenChange,
  initialTab = "save",
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTab?: TabValue;
}) {
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [saveName, setSaveName] = React.useState("");
  const [saves, setSaves] = React.useState<SimulationSave[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabValue>(initialTab);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");

  const {
    loading,
    loadSimulationSaves,
    loadSimulationSave,
    saveSimulation,
    removeSimulationSave,
    prepareSaveData,
  } = useSimulationSave();

  const { setSelectedNodes, setSelectedEdges, nodes, edges } =
    useNodeEdgeStore();

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setCurrentPage(1);
      setSearchQuery("");
      loadSaves();
    }
  }, [open, initialTab]);

  const loadSaves = async () => {
    const savedGames = await loadSimulationSaves();
    setSaves(savedGames);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const filteredSaves = React.useMemo(() => {
    return saves.filter((save) =>
      save.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [saves, searchQuery]);

  const totalPages = Math.ceil((filteredSaves.length + 1) / SLOTS_PER_PAGE);
  const currentSaves = React.useMemo(() => {
    const start = (currentPage - 1) * SLOTS_PER_PAGE;
    const end = start + SLOTS_PER_PAGE;
    return filteredSaves.slice(start, end);
  }, [filteredSaves, currentPage]);

  const handleSave = async () => {
    if (selectedSlot && saveName.trim()) {
      if (nodes.length === 0 && edges.length === 0) {
        toast({
          title: "Cannot save",
          description: "No nodes or edges to save",
          variant: "destructive",
        });
        return;
      }

      try {
        const saveData = prepareSaveData(
          saveName,
          "/placeholder.svg?height=120&width=200",
        );
        const saved = await saveSimulation(saveData);

        if (saved) {
          toast({
            title: "Simulation saved successfully",
            description: "Simulation data has been saved successfully",
          });
          await loadSaves();
          setSaveName("");
          setSelectedSlot(null);
          onOpenChange?.(false);
        }
      } catch (error) {
        console.error("Error saving simulation:", error);
        toast({
          title: "Failed to save simulation",
          description: "An error occurred while saving data",
          variant: "destructive",
        });
      }
    }
  };

  const handleLoad = async (save: SimulationSave) => {
    try {
      const loadedSave = await loadSimulationSave(save.id);
      if (!loadedSave) {
        throw new Error("Failed to load simulation data");
      }

      setSelectedNodes([]);
      setSelectedEdges([]);

      useNodeEdgeStore.setState({
        nodes: loadedSave.metadata.nodes,
        edges: loadedSave.metadata.edges,
      });

      toast({
        title: "Simulation loaded successfully",
        description: `Simulation "${loadedSave.name}" has been loaded successfully`,
      });

      onOpenChange?.(false);
    } catch (error) {
      console.error("Error loading simulation:", error);
      toast({
        title: "Failed to load simulation",
        description: "An error occurred while loading data",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (saveId: string) => {
    try {
      const success = await removeSimulationSave(saveId);
      if (success) {
        toast({
          title: "Simulation deleted successfully",
          description: "Simulation data has been deleted successfully",
        });
        await loadSaves();
      }
    } catch (error) {
      console.error("Error deleting simulation:", error);
      toast({
        title: "Failed to delete simulation",
        description: "An error occurred while deleting data",
        variant: "destructive",
      });
    }
  };

  const renderSaveSlot = (
    slotNumber: number,
    save?: SimulationSave,
    isLoadMode = false,
  ) => {
    const isEmpty = !save;
    const slotId = isEmpty ? `new-${slotNumber}` : save.id;
    const isSelected = selectedSlot === slotId;

    return (
      <Card
        key={slotNumber}
        className={`cursor-pointer transition-all hover:shadow-md focus-visible:outline-none ${
          isSelected ? "" : ""
        } ${isEmpty ? "border-dashed" : ""}`}
        onClick={() => {
          if (isLoadMode && save) {
            handleLoad(save);
          } else if (!isLoadMode) {
            setSelectedSlot(slotId);
            setSaveName(save?.name || `Save ${slotNumber}`);
          }
        }}
        onKeyDown={(e) => {
          const tag = (e.target as HTMLElement).tagName.toLowerCase();
          if (
            tag === "input" ||
            tag === "textarea" ||
            (e.target as HTMLElement).isContentEditable
          )
            return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isLoadMode && save) {
              handleLoad(save);
            } else if (!isLoadMode) {
              setSelectedSlot(slotId);
              setSaveName(save?.name || `Save ${slotNumber}`);
            }
          }
        }}
        tabIndex={0}>
        <CardContent className="p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm">New Save</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={save.screenshot || "/placeholder.svg"}
                  alt={save.name}
                  className="object-cover w-full h-20 rounded-md bg-muted"
                />
                <Badge
                  variant="secondary"
                  className="absolute text-xs top-1 right-1">
                  {save.metadata.nodes.length} Node
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium truncate">{save.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {save.metadata.edges.length} Edge
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(save.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(save.created_at).toLocaleTimeString("id-ID", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {!isLoadMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(save.id);
                  }}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Save className="w-5 h-5" />
            Save & Load Simulation
          </DialogTitle>
          <DialogDescription>
            Save current progress or load previous simulation
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">Save Simulation</TabsTrigger>
            <TabsTrigger value="load">Load Simulation</TabsTrigger>
          </TabsList>

          <TabsContent
            value="save"
            className="space-y-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent">
            <div className="space-y-2">
              <Label htmlFor="save-name">Save Name</Label>
              <Input
                id="save-name"
                placeholder="Enter save name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4 max-h-96">
              {currentSaves.map((save, index) =>
                renderSaveSlot(index + 1, save),
              )}
              {currentSaves.length < SLOTS_PER_PAGE &&
                renderSaveSlot(saves.length + 1)}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}>
                  Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    !selectedSlot ||
                    !saveName.trim() ||
                    loading ||
                    (nodes.length === 0 && edges.length === 0)
                  }>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Simulation"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="load"
            className="space-y-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4 max-h-96">
              {currentSaves.map((save, index) =>
                renderSaveSlot(index + 1, save, true),
              )}
              {filteredSaves.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 col-span-full text-muted-foreground">
                  <FileText className="w-12 h-12 mb-4" />
                  <p>No saved simulations</p>
                  <p className="text-sm">
                    {searchQuery
                      ? "Try different search keywords"
                      : "Create a save first to load it here"}
                  </p>
                </div>
              )}
            </div>

            {filteredSaves.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}>
                    Next
                  </Button>
                </div>
                <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
