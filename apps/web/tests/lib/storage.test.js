/**
 * Tests for Storage Abstraction
 */
import { getItem, setItem, removeItem, clear } from "../../lib/storage/storage";

describe("Storage Abstraction", () => {
  afterEach(() => {
    clear();
  });

  it("sets and gets items", () => {
    const data = { id: "1", name: "Test" };
    setItem("test", data);
    const retrieved = getItem("test");
    expect(retrieved).toEqual(data);
  });

  it("returns null for missing items", () => {
    const result = getItem("nonexistent");
    expect(result).toBeNull();
  });

  it("removes items", () => {
    setItem("test", { data: "value" });
    removeItem("test");
    expect(getItem("test")).toBeNull();
  });

  it("clears all CASA MX keys", () => {
    setItem("test1", { a: 1 });
    setItem("test2", { b: 2 });
    clear();
    expect(getItem("test1")).toBeNull();
    expect(getItem("test2")).toBeNull();
  });
});
