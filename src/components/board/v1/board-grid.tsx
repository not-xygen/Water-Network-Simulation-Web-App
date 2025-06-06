type BoardGridProps = {
  zoom: number;
  offset: { x: number; y: number };
  isSpacePressed: boolean;
  isDragging: boolean;
};

export const BoardGrid = ({
  zoom,
  offset,
  isSpacePressed,
  isDragging,
}: BoardGridProps) => {
  return (
    <div
      className="absolute inset-0 board-background z-[-10]"
      style={{
        backgroundSize: `${30 * (zoom / 100)}px ${30 * (zoom / 100)}px`,
        backgroundImage: `
          linear-gradient(to right, #b8b8b880 1px, transparent 1px),
          linear-gradient(to bottom, #b8b8b880 1px, transparent 1px)
        `,
        backgroundPosition: `${offset.x % (30 * (zoom / 100))}px ${
          offset.y % (30 * (zoom / 100))
        }px`,
        cursor: isSpacePressed ? (isDragging ? "grabbing" : "grab") : "default",
      }}
    />
  );
};
