import { describe, expect, it } from "vitest";
import { mergePreferences } from "./exercise.js";

describe("mergePreferences trust boundary", () => {
  it("ignores own keys that may reshape the result prototype", () => {
    const input = JSON.parse(
      '{"theme":"dark","__proto__":{"isAdmin":true}}'
    );
    const originalInputPrototype = Object.getPrototypeOf(input);
    const originalInputKeys = Reflect.ownKeys(input);
    const originalInputJson = JSON.stringify(input);
    const originalProtoDescriptor = Object.getOwnPropertyDescriptor(
      input,
      "__proto__"
    );

    const result = mergePreferences(input);

    expect(result).toEqual({ theme: "dark", pageSize: 20 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect("isAdmin" in result).toBe(false);
    expect(Object.getPrototypeOf(input)).toBe(originalInputPrototype);
    expect(Reflect.ownKeys(input)).toEqual(originalInputKeys);
    expect(JSON.stringify(input)).toBe(originalInputJson);
    expect(Object.getOwnPropertyDescriptor(input, "__proto__")).toEqual(
      originalProtoDescriptor
    );
    expect("isAdmin" in {}).toBe(false);
  });

  it("ignores inherited input properties even when their names are allowed", () => {
    const inherited = { theme: "dark" };
    const input = Object.create(inherited);
    input.pageSize = 30;

    expect(mergePreferences(input)).toEqual({
      theme: "light",
      pageSize: 30
    });
  });

  it("copies only the documented own preference keys", () => {
    const input = {
      theme: "dark",
      pageSize: 50,
      isAdmin: true,
      constructor: { prototype: { isAdmin: true } }
    };

    expect(mergePreferences(input)).toEqual({
      theme: "dark",
      pageSize: 50
    });
    expect(Object.keys(input)).toContain("isAdmin");
  });

  it("ignores allowed names when their own properties are not enumerable", () => {
    const input = {};
    Object.defineProperty(input, "theme", {
      value: "dark",
      writable: true,
      enumerable: false,
      configurable: true
    });

    expect(mergePreferences(input)).toEqual({
      theme: "light",
      pageSize: 20
    });
    expect(Object.getOwnPropertyDescriptor(input, "theme")).toEqual({
      value: "dark",
      writable: true,
      enumerable: false,
      configurable: true
    });
  });
});
