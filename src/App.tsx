import { BoardComponent } from "./components/board-components";
import { ToolsDock } from "./components/item-dock";
import { PositionDock } from "./components/position-dock";
import { ZoomDock } from "./components/zoom-dock";
import { ConnectionsLayer } from "./components/connectivity-component";

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BoardComponent />
      <ConnectionsLayer />
      <ToolsDock />
      <PositionDock />
      <ZoomDock />
    </div>
  );
}

export default App;
