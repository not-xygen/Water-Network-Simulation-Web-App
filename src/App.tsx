import { Board } from "./components/board";
import { DockNodeTools } from "./components/dock-node-tools";
import { DockPositionInfo } from "./components/dock-position-info";
import { DockZoomTools } from "./components/dock-zoom-tools";

function App() {
  return (
    <div
      id="board-container"
      className="relative w-screen h-screen overflow-hidden">
      <Board />
      <DockNodeTools />
      <DockPositionInfo />
      <DockZoomTools />
    </div>
  );
}

export default App;
