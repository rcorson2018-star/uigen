import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CodeEditor } from "../CodeEditor";
import { useFileSystem } from "@/lib/contexts/file-system-context";

vi.mock("@/lib/contexts/file-system-context", () => ({
  useFileSystem: vi.fn(),
}));

vi.mock("@monaco-editor/react", () => ({
  default: ({ language, value, onChange, onMount, theme, options }: any) => (
    <div
      data-testid="monaco-editor"
      data-language={language}
      data-value={value}
      data-theme={theme}
    />
  ),
}));

const mockUseFileSystem = {
  selectedFile: null as string | null,
  getFileContent: vi.fn(),
  updateFile: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useFileSystem as any).mockReturnValue(mockUseFileSystem);
});

afterEach(() => {
  cleanup();
});

test("renders empty state when no file is selected", () => {
  render(<CodeEditor />);
  expect(screen.getByText("Select a file to edit")).toBeDefined();
  expect(screen.getByText("Choose a file from the file tree")).toBeDefined();
});

test("does not render Monaco editor when no file is selected", () => {
  render(<CodeEditor />);
  expect(screen.queryByTestId("monaco-editor")).toBeNull();
});

test("renders Monaco editor when a file is selected", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("const x = 1;");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/App.tsx",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor")).toBeDefined();
});

test("detects typescript language for .ts files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("const x: number = 1;");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/utils.ts",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("typescript");
});

test("detects typescript language for .tsx files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("export default function App() {}");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/App.tsx",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("typescript");
});

test("detects javascript language for .js files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("const x = 1;");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/index.js",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("javascript");
});

test("detects javascript language for .jsx files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("<div />");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/App.jsx",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("javascript");
});

test("detects css language for .css files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("body { margin: 0; }");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/styles.css",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("css");
});

test("detects json language for .json files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue('{"key": "value"}');
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/package.json",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("json");
});

test("detects html language for .html files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("<html></html>");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/index.html",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("html");
});

test("detects markdown language for .md files", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("# Title");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/README.md",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("markdown");
});

test("falls back to plaintext for unknown extensions", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("some content");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/config.yaml",
  });

  render(<CodeEditor />);
  expect(screen.getByTestId("monaco-editor").getAttribute("data-language")).toBe("plaintext");
});

test("passes file content to Monaco editor", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("const hello = 'world';");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/index.ts",
  });

  render(<CodeEditor />);
  expect(
    screen.getByTestId("monaco-editor").getAttribute("data-value")
  ).toBe("const hello = 'world';");
});

test("passes empty string when file content is null", () => {
  mockUseFileSystem.getFileContent.mockReturnValue(null);
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/empty.ts",
  });

  render(<CodeEditor />);
  expect(
    screen.getByTestId("monaco-editor").getAttribute("data-value")
  ).toBe("");
});

test("uses vs-dark theme", () => {
  mockUseFileSystem.getFileContent.mockReturnValue("code");
  (useFileSystem as any).mockReturnValue({
    ...mockUseFileSystem,
    selectedFile: "/src/App.tsx",
  });

  render(<CodeEditor />);
  expect(
    screen.getByTestId("monaco-editor").getAttribute("data-theme")
  ).toBe("vs-dark");
});
