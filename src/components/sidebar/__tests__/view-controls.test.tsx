import "@/test/setup";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ViewControls } from "../view-controls";

describe("ViewControls", () => {
  const defaultProps = {
    zoom: 100,
    displayX: 100,
    displayY: 200,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    resetPosition: vi.fn(),
  };

  it("renders correctly with default props", () => {
    render(<ViewControls {...defaultProps} />);

    expect(screen.getByText("X: 100")).toBeInTheDocument();
    expect(screen.getByText("Y: 200")).toBeInTheDocument();

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("displays correct coordinates", () => {
    const props = {
      ...defaultProps,
      displayX: 123.45,
      displayY: 67.89,
    };

    render(<ViewControls {...props} />);

    expect(screen.getByText("X: 123")).toBeInTheDocument();
    expect(screen.getByText("Y: 68")).toBeInTheDocument();
  });

  it("calls zoomIn when zoom in button is clicked", () => {
    render(<ViewControls {...defaultProps} />);

    const zoomButton = screen.getByText("100");
    fireEvent.click(zoomButton);

    const zoomInButton = screen.getByText("Zoom In");
    fireEvent.click(zoomInButton);

    expect(defaultProps.zoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls zoomOut when zoom out button is clicked", () => {
    render(<ViewControls {...defaultProps} />);

    const zoomButton = screen.getByText("100");
    fireEvent.click(zoomButton);

    const zoomOutButton = screen.getByText("Zoom Out");
    fireEvent.click(zoomOutButton);

    expect(defaultProps.zoomOut).toHaveBeenCalledTimes(1);
  });

  it("calls resetZoom when reset zoom button is clicked", () => {
    render(<ViewControls {...defaultProps} />);

    const zoomButton = screen.getByText("100");
    fireEvent.click(zoomButton);

    const resetZoomButton = screen.getByText("Reset Zoom");
    fireEvent.click(resetZoomButton);

    expect(defaultProps.resetZoom).toHaveBeenCalledTimes(1);
  });

  it("calls resetPosition when reset position button is clicked", () => {
    render(<ViewControls {...defaultProps} />);

    const zoomButton = screen.getByText("100");
    fireEvent.click(zoomButton);

    const resetPositionButton = screen.getByText("Reset Position");
    fireEvent.click(resetPositionButton);

    expect(defaultProps.resetPosition).toHaveBeenCalledTimes(1);
  });

  it("displays keyboard shortcuts correctly", () => {
    render(<ViewControls {...defaultProps} />);

    const zoomButton = screen.getByText("100");
    fireEvent.click(zoomButton);

    expect(screen.getByText("Ctrl++")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+-")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+0")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+R")).toBeInTheDocument();
  });

  it("renders with different zoom level", () => {
    render(<ViewControls {...defaultProps} zoom={150} />);

    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders with different coordinates", () => {
    render(<ViewControls {...defaultProps} displayX={300} displayY={400} />);

    expect(screen.getByText("X: 300")).toBeInTheDocument();
    expect(screen.getByText("Y: 400")).toBeInTheDocument();
  });
});
