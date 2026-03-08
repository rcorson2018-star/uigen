import { test, expect, beforeEach } from "vitest";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { VirtualFileSystem } from "@/lib/file-system";

let fs: VirtualFileSystem;
let tool: ReturnType<typeof buildFileManagerTool>;

beforeEach(() => {
  fs = new VirtualFileSystem();
  tool = buildFileManagerTool(fs);
});

// rename

test("rename returns success when file is renamed", async () => {
  fs.createFileWithParents("/src/old.ts", "content");
  const result = await tool.execute({
    command: "rename",
    path: "/src/old.ts",
    new_path: "/src/new.ts",
  });
  expect(result).toMatchObject({ success: true });
  expect(fs.readFile("/src/new.ts")).toBe("content");
});

test("rename returns success message with old and new path", async () => {
  fs.createFileWithParents("/src/old.ts", "");
  const result = await tool.execute({
    command: "rename",
    path: "/src/old.ts",
    new_path: "/src/new.ts",
  }) as any;
  expect(result.message).toContain("/src/old.ts");
  expect(result.message).toContain("/src/new.ts");
});

test("rename returns error when new_path is not provided", async () => {
  const result = await tool.execute({
    command: "rename",
    path: "/src/old.ts",
  }) as any;
  expect(result.success).toBe(false);
  expect(result.error).toContain("new_path is required");
});

test("rename returns error when file does not exist", async () => {
  const result = await tool.execute({
    command: "rename",
    path: "/src/nonexistent.ts",
    new_path: "/src/new.ts",
  }) as any;
  expect(result.success).toBe(false);
  expect(result.error).toContain("Failed to rename");
});

// delete

test("delete returns success when file is deleted", async () => {
  fs.createFileWithParents("/src/App.tsx", "code");
  const result = await tool.execute({
    command: "delete",
    path: "/src/App.tsx",
  }) as any;
  expect(result.success).toBe(true);
  expect(fs.readFile("/src/App.tsx")).toBeNull();
});

test("delete returns success message with path", async () => {
  fs.createFileWithParents("/src/App.tsx", "");
  const result = await tool.execute({
    command: "delete",
    path: "/src/App.tsx",
  }) as any;
  expect(result.message).toContain("/src/App.tsx");
});

test("delete returns error when file does not exist", async () => {
  const result = await tool.execute({
    command: "delete",
    path: "/src/nonexistent.tsx",
  }) as any;
  expect(result.success).toBe(false);
  expect(result.error).toContain("Failed to delete");
});
