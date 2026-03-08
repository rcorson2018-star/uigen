import { test, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

beforeEach(() => {
  sessionStorage.clear();
});

// setHasAnonWork

test("setHasAnonWork stores data when messages are present", () => {
  const messages = [{ role: "user", content: "Hello" }];
  setHasAnonWork(messages, {});
  expect(sessionStorage.getItem("uigen_has_anon_work")).toBe("true");
});

test("setHasAnonWork stores data when fileSystem has more than root", () => {
  setHasAnonWork([], { "/": {}, "/src/App.tsx": {} });
  expect(sessionStorage.getItem("uigen_has_anon_work")).toBe("true");
});

test("setHasAnonWork does not store when no messages and only root in fileSystem", () => {
  setHasAnonWork([], { "/": {} });
  expect(sessionStorage.getItem("uigen_has_anon_work")).toBeNull();
});

test("setHasAnonWork does not store when arrays and fileSystem are empty", () => {
  setHasAnonWork([], {});
  expect(sessionStorage.getItem("uigen_has_anon_work")).toBeNull();
});

test("setHasAnonWork saves messages and fileSystemData as JSON", () => {
  const messages = [{ role: "user", content: "Hi" }];
  const fileSystemData = { "/": {}, "/App.tsx": "code" };
  setHasAnonWork(messages, fileSystemData);

  const stored = JSON.parse(sessionStorage.getItem("uigen_anon_data")!);
  expect(stored.messages).toEqual(messages);
  expect(stored.fileSystemData).toEqual(fileSystemData);
});

// getHasAnonWork

test("getHasAnonWork returns false when nothing is stored", () => {
  expect(getHasAnonWork()).toBe(false);
});

test("getHasAnonWork returns true after setHasAnonWork with content", () => {
  setHasAnonWork([{ role: "user", content: "Hi" }], {});
  expect(getHasAnonWork()).toBe(true);
});

// getAnonWorkData

test("getAnonWorkData returns null when nothing is stored", () => {
  expect(getAnonWorkData()).toBeNull();
});

test("getAnonWorkData returns stored data", () => {
  const messages = [{ role: "user", content: "Hello" }];
  const fileSystemData = { "/": {} };
  setHasAnonWork(messages, fileSystemData);

  const result = getAnonWorkData();
  expect(result).toEqual({ messages, fileSystemData });
});

test("getAnonWorkData returns null for corrupted JSON", () => {
  sessionStorage.setItem("uigen_anon_data", "not-valid-json{{{");
  expect(getAnonWorkData()).toBeNull();
});

// clearAnonWork

test("clearAnonWork removes stored data", () => {
  setHasAnonWork([{ role: "user", content: "Hi" }], {});
  clearAnonWork();

  expect(sessionStorage.getItem("uigen_has_anon_work")).toBeNull();
  expect(sessionStorage.getItem("uigen_anon_data")).toBeNull();
});

test("clearAnonWork is safe to call when nothing is stored", () => {
  expect(() => clearAnonWork()).not.toThrow();
});

test("getHasAnonWork returns false after clearAnonWork", () => {
  setHasAnonWork([{ role: "user", content: "Hi" }], {});
  clearAnonWork();
  expect(getHasAnonWork()).toBe(false);
});
