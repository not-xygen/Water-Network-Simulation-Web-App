import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "../use-toast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Test Toast",
      description: "This is a test toast",
      open: true,
    });
  });

  it("should dismiss a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("should update a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    act(() => {
      result.current.toast({
        title: "Updated Toast",
        description: "This is an updated toast",
        type: "foreground",
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      title: "Updated Toast",
      description: "This is an updated toast",
      type: "foreground",
    });
  });

  it("should remove toast after delay", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Test Toast",
        description: "This is a test toast",
      });
    });

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    act(() => {
      vi.advanceTimersByTime(1000000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
