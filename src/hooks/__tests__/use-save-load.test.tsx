import { useSupabaseClient } from "@/lib/supabase/client";
import useNodeEdgeStore from "@/store/node-edge";
import type { Edge, Node } from "@/types/node-edge";
import type { SimulationSave } from "@/types/save-load";
import { useUser } from "@clerk/clerk-react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulationSave } from "../use-save-load";

vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  useSupabaseClient: vi.fn(),
}));

vi.mock("@/store/node-edge", () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe("useSimulationSave", () => {
  const mockUser = {
    id: "user-123",
  };

  const mockSupabase = {
    from: vi.fn(),
  };

  const mockNodes: Node[] = [];
  const mockEdges: Edge[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    });
    (useSupabaseClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );
    (useNodeEdgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      nodes: mockNodes,
      edges: mockEdges,
    });
  });

  it("should load simulation saves", async () => {
    const mockSaves: SimulationSave[] = [
      {
        id: "save-1",
        name: "Save 1",
        user_id: "user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        screenshot: "base64-image",
        metadata: {
          nodes: [],
          edges: [],
        },
      },
      {
        id: "save-2",
        name: "Save 2",
        user_id: "user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        screenshot: "base64-image",
        metadata: {
          nodes: [],
          edges: [],
        },
      },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockSaves }),
    });

    const { result } = renderHook(() => useSimulationSave());

    let saves: SimulationSave[] = [];
    await act(async () => {
      saves = await result.current.loadSimulationSaves();
    });

    expect(saves).toEqual(mockSaves);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should handle load simulation saves error", async () => {
    const error = new Error("Failed to load saves");
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockRejectedValue(error),
    });

    const { result } = renderHook(() => useSimulationSave());

    let saves: SimulationSave[] = [];
    await act(async () => {
      saves = await result.current.loadSimulationSaves();
    });

    expect(saves).toEqual([]);
    expect(result.current.error).toBe(error);
    expect(result.current.loading).toBe(false);
  });

  it("should save simulation", async () => {
    const saveData = {
      name: "Test Save",
      screenshot: "base64-image",
      metadata: {
        nodes: [],
        edges: [],
      },
    };

    const mockResponse = {
      data: {
        id: "new-save",
        name: "Test Save",
        user_id: "user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        screenshot: "base64-image",
        metadata: {
          nodes: [],
          edges: [],
        },
      },
      error: null,
    };

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useSimulationSave());

    let savedId: string | null = null;
    await act(async () => {
      const response = await result.current.saveSimulation(saveData);
      savedId = response?.id ?? null;
    });

    expect(savedId).toBe("new-save");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should prepare save data correctly", () => {
    const { result } = renderHook(() => useSimulationSave());

    const saveData = result.current.prepareSaveData(
      "Test Save",
      "base64-image",
    );

    expect(saveData).toEqual({
      name: "Test Save",
      screenshot: "base64-image",
      metadata: {
        nodes: [],
        edges: [],
      },
    });
  });

  it("should not perform operations if user is not available", async () => {
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useSimulationSave());

    const saveData = {
      name: "Test Save",
      screenshot: "base64-image",
      metadata: {
        nodes: [],
        edges: [],
      },
    };

    let savedId: string | null = null;
    await act(async () => {
      const response = await result.current.saveSimulation(saveData);
      savedId = response?.id ?? null;
    });

    expect(savedId).toBe(null);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});
