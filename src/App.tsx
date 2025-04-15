import { BoardComponent } from "./components/board-components";
import { ToolsDock } from "./components/item-dock";
import { PositionDock } from "./components/position-dock";
import { ZoomDock } from "./components/zoom-dock";

function App() {
  return (
    <>
      <BoardComponent />
      <ToolsDock />
      <PositionDock />
      <ZoomDock />
    </>
  );
}

export default App;
