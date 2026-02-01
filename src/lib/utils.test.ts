import { describe, it, expect } from "vitest";
import { cn, formatDate, getUniqueTags } from "./utils";

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatDate", () => {
  it("formats date strings correctly", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("getUniqueTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    const experiments = [
      { tags: ["react", "animation"] },
      { tags: ["react", "css"] },
      { tags: ["typescript"] },
    ];
    expect(getUniqueTags(experiments)).toEqual([
      "animation",
      "css",
      "react",
      "typescript",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(getUniqueTags([])).toEqual([]);
  });
});
