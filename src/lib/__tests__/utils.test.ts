import { test, expect } from "vitest";
import { cn } from "@/lib/utils";

test("returns a single class name unchanged", () => {
  expect(cn("text-red-500")).toBe("text-red-500");
});

test("merges multiple class names", () => {
  expect(cn("flex", "items-center", "justify-center")).toBe(
    "flex items-center justify-center"
  );
});

test("resolves tailwind conflicts by keeping the last value", () => {
  expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  expect(cn("p-4", "p-8")).toBe("p-8");
});

test("ignores falsy values", () => {
  expect(cn("flex", false, null, undefined, "items-center")).toBe(
    "flex items-center"
  );
});

test("handles conditional classes via objects", () => {
  expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
    "text-red-500"
  );
});

test("handles conditional classes via arrays", () => {
  expect(cn(["flex", "items-center"])).toBe("flex items-center");
});

test("handles mixed inputs", () => {
  const isActive = true;
  expect(cn("base", { active: isActive }, isActive && "text-blue-500")).toBe(
    "base active text-blue-500"
  );
});

test("returns empty string for no inputs", () => {
  expect(cn()).toBe("");
});
