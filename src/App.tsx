import { useEffect, useRef, useState } from "react";

import { Board } from "@/components/board";
import { DockNodeTools } from "@/components/dock-node-tools";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function App() {
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      id="board-container"
      ref={boardRef}
      className="relative w-screen h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="w-screen h-screen">
        <ResizablePanel
          defaultSize={15}
          minSize={15}
          maxSize={20}
          className="z-40 bg-white">
          <SidebarLeft />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={40} maxSize={70}>
          <Board isSpacePressed={isSpacePressed} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={15}
          minSize={15}
          maxSize={30}
          className="z-40 bg-white">
          <SidebarRight />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Docks */}
      <DockNodeTools />
    </div>
  );
}

export default App;
