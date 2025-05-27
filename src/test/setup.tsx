/* eslint-disable no-unused-vars */
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
        // biome-ignore lint/a11y/useSemanticElements: <intended>
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
        // biome-ignore lint/a11y/useSemanticElements: <intended>
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

vi.mock("@/components/ui/button", () => {
  return {
    Button: ({
      children,
      onClick,
      disabled,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
        {children}
      </button>
    ),
  };
});

vi.mock("@/components/ui/input", () => {
  return {
    Input: ({
      value,
      onChange,
      placeholder,
      disabled,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
      disabled?: boolean;
    }) => (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    ),
  };
});

vi.mock("@/components/ui/textarea", () => {
  return {
    Textarea: ({
      value,
      onChange,
      placeholder,
      disabled,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      placeholder?: string;
      disabled?: boolean;
    }) => (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    ),
  };
});

vi.mock("@/components/ui/card", () => {
  return {
    Card: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    CardHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-header">{children}</div>
    ),
    CardTitle: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-title">{children}</div>
    ),
    CardDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-description">{children}</div>
    ),
    CardContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-content">{children}</div>
    ),
    CardFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card-footer">{children}</div>
    ),
  };
});

vi.mock("@/components/ui/label", () => {
  return {
    Label: ({
      children,
      htmlFor,
    }: {
      children: React.ReactNode;
      htmlFor?: string;
    }) => (
      <label htmlFor={htmlFor} data-testid="label">
        {children}
      </label>
    ),
  };
});

vi.mock("@/components/ui/separator", () => {
  return {
    Separator: ({ className }: { className?: string }) => (
      <hr data-testid="separator" className={className} />
    ),
  };
});

vi.mock("@/components/ui/badge", () => {
  return {
    Badge: ({
      children,
      variant,
    }: {
      children: React.ReactNode;
      variant?: string;
    }) => (
      <span data-testid="badge" data-variant={variant}>
        {children}
      </span>
    ),
  };
});

vi.mock("@/components/ui/progress", () => {
  return {
    Progress: ({ value }: { value?: number }) => (
      <div data-testid="progress" data-value={value} />
    ),
  };
});

vi.mock("@/components/ui/skeleton", () => {
  return {
    Skeleton: ({ className }: { className?: string }) => (
      <div data-testid="skeleton" className={className} />
    ),
  };
});

vi.mock("@/components/ui/tooltip", () => {
  return {
    Tooltip: ({
      children,
      content,
    }: {
      children: React.ReactNode;
      content: React.ReactNode;
    }) => (
      <div data-testid="tooltip" data-content={content?.toString()}>
        {children}
      </div>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tooltip-trigger">{children}</div>
    ),
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tooltip-content">{children}</div>
    ),
  };
});

vi.mock("@/components/ui/alert-dialog", () => {
  return {
    AlertDialog: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open?: boolean;
    }) => <div data-state={open ? "open" : "closed"}>{children}</div>,
    AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogAction: ({
      children,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
        {children}
      </button>
    ),
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
  };
});

export default {};
