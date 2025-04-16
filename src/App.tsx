import { Whiteboard } from "./components/whiteboard";
import { ToolsDock } from "./components/tools-dock";
import { PositionDock } from "./components/position-dock";
import { ZoomDock } from "./components/zoom-dock";

function App() {
  return (
    <div
      id="board-container"
      className="relative w-screen h-screen overflow-hidden">
      <Whiteboard />
      <ToolsDock />
      <PositionDock />
      <ZoomDock />
    </div>
  );
}

export default App;
