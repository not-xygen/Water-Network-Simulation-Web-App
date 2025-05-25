import { useImportExportHandler } from "@/hooks/use-import-export";
import { resetSimulation } from "@/lib/engine/v2";
import useNodeEdgeStore from "@/store/node-edge";
import type { Edge, Node } from "@/types/node-edge";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import {
  ChevronDown,
  ChevronRight,
  Cog,
  File,
  FileDown,
  FileText,
  FileUp,
  ListRestart,
  LogIn,
  LogOut,
  MenuIcon,
  Save,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertDialogAction } from "../dialog/alert-dialog-action";
import { DialogImportFile } from "../dialog/dialog-import-file";
import { DialogSaveLoad } from "../dialog/dialog-save-load";
import { DialogPreferences } from "../preferences/dialog-preferences";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown";

export const SidebarLeft = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const {
    nodes,
    edges,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
  } = useNodeEdgeStore();
  const navigate = useNavigate();

  const [nodeListMenuOpen, setNodeListMenuOpen] = useState(true);
  const [edgeListMenuOpen, setEdgeListMenuOpen] = useState(true);

  const { exportData, importData } = useImportExportHandler();

  const [openPreferences, setOpenPreferences] = useState(false);
  const [preferencesSection, setPreferencesSection] = useState("general");
  const [openSaveLoad, setOpenSaveLoad] = useState(false);
  const [saveLoadTab, setSaveLoadTab] = useState<"save" | "load">("save");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const handleOpenPreferences = (section: string) => {
    setPreferencesSection(section);
    setOpenPreferences(true);
  };

  const resetBoard = () => {
    useNodeEdgeStore.setState({
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
    });
  };

  const handleNew = () => {
    window.open(window.location.href, "_blank");
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white border-r">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
            className="p-1 space-y-1 text-xs bg-white border rounded-lg shadow cursor-pointer w-[240px]">
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                onSelect={(e) => {
                  e.preventDefault();
                  handleNew();
                }}>
                <File className="w-3 h-3" />
                New Board
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SignedIn>
                <DropdownMenuItem
                  className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                  onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setSaveLoadTab("save");
                    setTimeout(() => {
                      setOpenSaveLoad(true);
                    }, 0);
                  }}>
                  <Save className="w-3 h-3" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                  onSelect={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setSaveLoadTab("load");
                    setTimeout(() => {
                      setOpenSaveLoad(true);
                    }, 0);
                  }}>
                  <FileText className="w-3 h-3" />
                  Load
                </DropdownMenuItem>
              </SignedIn>
              <SignedOut>
                <AlertDialogAction
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                      <Save className="w-3 h-3" />
                      Save
                    </DropdownMenuItem>
                  }
                  title="You need to sign in to save or load your simulation"
                  description="Please sign in to save or load your simulation"
                  actionText="Sign In"
                  onAction={() => navigate("/sign-in")}
                />
                <AlertDialogAction
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs">
                      <FileText className="w-3 h-3" />
                      Load
                    </DropdownMenuItem>
                  }
                  title="You need to sign in to save or load your simulation"
                  description="Please sign in to save or load your simulation"
                  actionText="Sign In"
                  onAction={() => navigate("/sign-in")}
                />
              </SignedOut>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setTimeout(() => {
                    setOpenImport(true);
                  }, 0);
                }}>
                <FileUp className="w-3 h-3" />
                Import
              </DropdownMenuItem>
              <AlertDialogAction
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
              <AlertDialogAction
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
                  resetBoard();
                  resetSimulation();
                }}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setTimeout(() => {
                    handleOpenPreferences("general");
                  }, 0);
                }}>
                <Cog className="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <SignedIn>
                <AlertDialogAction
                  trigger={
                    <DropdownMenuItem
                      className="flex flex-row items-center gap-2 p-1 text-xs md:text-xs"
                      onSelect={(e) => e.preventDefault()}>
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </DropdownMenuItem>
                  }
                  title="Sign Out?"
                  description="Are you sure you want to sign out from your account?"
                  actionText="Sign Out"
                  onAction={() => {
                    clerk.signOut();
                  }}
                />
              </SignedIn>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <h1 className="text-lg font-bold">WNS</h1>
      </div>

      {/* Konten Scrollable */}
      <div className="flex-1 px-2 py-2 overflow-y-auto">
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
            {nodes.length === 0 && (
              <h3 className="px-2 text-xs text-gray-500">
                No Nodes in the board
              </h3>
            )}
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
            {edges.length === 0 && (
              <h3 className="px-2 text-xs text-gray-500">
                No Edges in the board
              </h3>
            )}
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

      {/* Footer Sticky */}
      <div className="sticky bottom-0 z-10 bg-white border-t">
        <SignedOut>
          <Link to="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <div
            className="flex items-center w-full gap-2 p-3 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setPreferencesSection("account");
              setOpenPreferences(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setPreferencesSection("account");
                setOpenPreferences(true);
              }
            }}>
            <Avatar className="w-8 h-8 rounded-full">
              <AvatarImage
                src={user?.imageUrl}
                alt="avatar"
                className="object-cover w-8 h-8 rounded-full"
              />
              <AvatarFallback>
                {user?.fullName?.[0] ?? user?.username?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">
              {user?.fullName ||
                user?.username ||
                user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </SignedIn>
      </div>

      {/* Preferences Dialog */}
      <DialogPreferences
        open={openPreferences}
        onOpenChange={setOpenPreferences}
        initialSection={preferencesSection}
      />

      {/* Save Load Dialog */}
      <DialogSaveLoad
        open={openSaveLoad}
        onOpenChange={setOpenSaveLoad}
        initialTab={saveLoadTab}
      />

      {/* Import Dialog */}
      <DialogImportFile
        open={openImport}
        onOpenChange={setOpenImport}
        allowedFileTypes={[".json"]}
        maxFileSize={10}
        onImport={importData}
      />
    </div>
  );
};
