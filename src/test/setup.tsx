import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import type React from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { handlers } from "./handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

vi.mock("@radix-ui/react-dialog", () => {
  return {
    Root: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open?: boolean;
    }) => <div data-state={open ? "open" : "closed"}>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Overlay: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Description: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Close: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
  };
});

vi.mock("@radix-ui/react-dropdown-menu", () => {
  return {
    Root: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open?: boolean;
    }) => <div data-state={open ? "open" : "closed"}>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Sub: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SubTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SubContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    RadioGroup: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    RadioItem: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    CheckboxItem: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Item: ({
      children,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        aria-disabled={disabled}>
        {children}
      </div>
    ),
    Group: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Separator: () => <hr />,
    Shortcut: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    Label: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@radix-ui/react-select", () => {
  return {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Value: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Group: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Label: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ScrollUpButton: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ScrollDownButton: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Item: ({
      children,
      value,
      disabled,
    }: {
      children: React.ReactNode;
      value?: string;
      disabled?: boolean;
    }) => (
      <div
        // biome-ignore lint/a11y/useSemanticElements: <intended>
        role="button"
        tabIndex={0}
        data-value={value}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        aria-disabled={disabled}>
        {children}
      </div>
    ),
    Separator: () => <hr />,
    Icon: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Viewport: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ItemText: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@radix-ui/react-switch", () => {
  return {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Thumb: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@radix-ui/react-separator", () => {
  return {
    Root: ({ orientation }: { orientation?: "horizontal" | "vertical" }) => (
      <hr data-orientation={orientation} />
    ),
  };
});

vi.mock("@radix-ui/react-alert-dialog", () => {
  return {
    Root: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open?: boolean;
    }) => <div data-state={open ? "open" : "closed"}>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Overlay: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Description: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Action: ({
      children,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        aria-disabled={disabled}>
        {children}
      </div>
    ),
    Cancel: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

export default {};
