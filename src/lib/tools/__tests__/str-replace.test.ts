import { test, expect, beforeEach } from "vitest";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { VirtualFileSystem } from "@/lib/file-system";

let fs: VirtualFileSystem;
let tool: ReturnType<typeof buildStrReplaceTool>;

beforeEach(() => {
  fs = new VirtualFileSystem();
  tool = buildStrReplaceTool(fs);
});

test("tool has correct id", () => {
  expect(tool.id).toBe("str_replace_editor");
});

test("create command creates a file with content", async () => {
  const result = await tool.execute({
    command: "create",
    path: "/src/App.tsx",
    file_text: "export default function App() {}",
  });

  expect(result).toContain("App.tsx");
  expect(fs.readFile("/src/App.tsx")).toBe("export default function App() {}");
});

test("create command creates a file with empty content when file_text is omitted", async () => {
  await tool.execute({ command: "create", path: "/src/empty.ts" });
  expect(fs.readFile("/src/empty.ts")).toBe("");
});

test("view command returns file content", async () => {
  fs.createFileWithParents("/src/index.ts", "const x = 1;\nconst y = 2;");
  const result = await tool.execute({ command: "view", path: "/src/index.ts" });
  expect(result).toContain("const x = 1;");
  expect(result).toContain("const y = 2;");
});

test("view command respects view_range", async () => {
  fs.createFileWithParents("/src/index.ts", "line1\nline2\nline3\nline4");
  const result = await tool.execute({
    command: "view",
    path: "/src/index.ts",
    view_range: [2, 3],
  });
  expect(result).toContain("line2");
  expect(result).toContain("line3");
});

test("str_replace command replaces text in a file", async () => {
  fs.createFileWithParents("/src/App.tsx", "Hello World");
  await tool.execute({
    command: "str_replace",
    path: "/src/App.tsx",
    old_str: "World",
    new_str: "React",
  });
  expect(fs.readFile("/src/App.tsx")).toBe("Hello React");
});

test("str_replace uses empty strings when old_str/new_str are omitted", async () => {
  fs.createFileWithParents("/src/App.tsx", "Hello");
  await tool.execute({
    command: "str_replace",
    path: "/src/App.tsx",
  });
  // replaceInFile("", "") - no change expected
  expect(fs.readFile("/src/App.tsx")).toBe("Hello");
});

test("insert command inserts text at a line", async () => {
  fs.createFileWithParents("/src/App.tsx", "line1\nline3");
  await tool.execute({
    command: "insert",
    path: "/src/App.tsx",
    insert_line: 1,
    new_str: "line2",
  });
  expect(fs.readFile("/src/App.tsx")).toContain("line2");
});

test("undo_edit command returns unsupported error message", async () => {
  const result = await tool.execute({
    command: "undo_edit",
    path: "/src/App.tsx",
  });
  expect(result).toContain("not supported");
});
