import {
  ChevronDown,
  ChevronRight,
  Cog,
  File,
  FileDown,
  FileUp,
  ListRestart,
  LogIn,
  MenuIcon,
  Save,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { resetSimulation } from "@/handlers/use-engine-v2-handler";
import { useImportExportHandler } from "@/handlers/use-import-export-handler";
import useNodeEdgeStore from "@/store/node-edge";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";

import { ActionAlertDialog } from "./action-alert-dialog";
import { DialogImportFile } from "./dialog-import-file";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown";
import { Separator } from "./ui/separator";

import type { Edge, Node } from "@/types/node-edge";
import { DialogPreferences } from "./dialog-preferences";

export const SidebarLeft = () => {
  const { user } = useUser();
  const {
    nodes,
    edges,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
  } = useNodeEdgeStore();

  const [nodeListMenuOpen, setNodeListMenuOpen] = useState(true);
  const [edgeListMenuOpen, setEdgeListMenuOpen] = useState(true);

  const { exportData, importData } = useImportExportHandler();

  return (
    <div className="flex flex-col justify-between w-full h-full overflow-y-auto text-xs text-gray-700 border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 text-xs font-semibold text-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex flex-row justify-end gap-1 px-3 py-1 space-x-2 max-w-max h-max"
                variant={"outline"}>
                <MenuIcon className="p-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
              className="p-1 space-y-1 text-xs bg-white border rounded-lg shadow cursor-pointer w-max">
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                  <File className="w-3 h-3" />
                  New
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                  <Save className="w-3 h-3" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                  <Upload className="w-3 h-3" />
                  Load
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                  onSelect={(e) => e.preventDefault()}>
                  <DialogImportFile
                    allowedFileTypes={[".json"]}
                    maxFileSize={10}
                    maxFiles={1}
                    onImport={importData}>
                    <div className="flex flex-row items-center w-full gap-2">
                      <FileUp className="w-3 h-3" />
                      Import
                    </div>
                  </DialogImportFile>
                </DropdownMenuItem>
                <ActionAlertDialog
                  trigger={
                    <DropdownMenuItem
                      className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                      onSelect={(e) => e.preventDefault()}>
                      <FileDown className="w-3 h-3" />
                      Export
                    </DropdownMenuItem>
                  }
                  title="Export Data & Reset Simulation?"
                  description="All data will be exported and the simulation will be reset. Are you sure you want to continue?"
                  actionText="Export & Reset"
                  onAction={() => {
                    exportData();
                    resetSimulation();
                  }}
                />
                <DropdownMenuSeparator />
                <ActionAlertDialog
                  trigger={
                    <DropdownMenuItem
                      className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                      onSelect={(e) => e.preventDefault()}>
                      <ListRestart className="w-3 h-3" />
                      Reset Board & Simulation
                    </DropdownMenuItem>
                  }
                  title="Reset Board & Simulation?"
                  description="All nodes, edges, and simulation data will be cleared. Are you sure you want to reset everything?"
                  actionText="Reset"
                  onAction={() => {
                    resetSimulation();
                  }}
                />
                <DropdownMenuSeparator />
                <DialogPreferences>
                  <DropdownMenuItem
                    className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                    onSelect={(e) => e.preventDefault()}>
                    <Cog className="w-4 h-4" />
                    Preferences
                  </DropdownMenuItem>
                </DialogPreferences>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <h1 className="text-lg font-bold">WNS</h1>
        </div>

        <Separator className="h-0.5 bg-gray-200 rounded-md" />

        {/* Node List */}
        <Collapsible
          open={nodeListMenuOpen}
          onOpenChange={setNodeListMenuOpen}
          className="w-full space-y-0.5">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-700">
            <span>Nodes</span>
            {nodeListMenuOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {nodes.length > 0 &&
              nodes.map((n: Node) => (
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setSelectedNodes([n]);
                    setSelectedEdges([]);
                  }}
                  key={n.id}
                  className={`flex items-center justify-between px-2 py-1 text-xs font-semibold cursor-pointer h-max text-gray-700 rounded-sm ${
                    selectedNodes.some((sel) => sel.id === n.id)
                      ? "bg-blue-200"
                      : " hover:bg-gray-100"
                  }`}>
                  <span>{n.label}</span>
                </Button>
              ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="h-0.5 bg-gray-200 rounded-md mt-1" />

        {/* Edge List */}
        <Collapsible
          open={edgeListMenuOpen}
          onOpenChange={setEdgeListMenuOpen}
          className="w-full space-y-0.5">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-700">
            <span>Edges</span>
            {edgeListMenuOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {edges.length > 0 &&
              edges.map((e: Edge) => (
                <Button
                  variant={"ghost"}
                  key={e.id}
                  onClick={() => {
                    setSelectedEdges([e]);
                    setSelectedNodes([]);
                  }}
                  className={`flex items-center justify-between px-2 py-1 text-xs font-semibold cursor-pointer h-max text-gray-700 rounded-sm ${
                    selectedEdges.some((sel) => sel.id === e.id)
                      ? "bg-blue-200"
                      : " hover:bg-gray-100"
                  }`}>
                  <span>{e.label}</span>
                </Button>
              ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="flex items-center gap-2 p-2">
        <SignedOut>
          <Link to="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Masuk
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center w-full gap-2 p-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "shadow-lg",
                  userButtonPopoverActionButton: "hover:bg-accent",
                  userButtonPopoverActionButtonText: "text-sm",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
            <span className="text-sm font-medium truncate">
              {user?.fullName ||
                user?.username ||
                user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};
