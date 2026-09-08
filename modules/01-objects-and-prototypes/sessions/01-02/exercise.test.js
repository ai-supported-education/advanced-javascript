import { describe, expect, it } from "vitest";
import { createTaskRecord } from "./exercise.js";

describe("createTaskRecord property contract", () => {
  it("keeps id visible to ordinary copying and serialization", () => {
    const record = createTaskRecord("T-17", "Проверить сборку");

    expect(Object.keys(record)).toContain("id");
    expect({ ...record }).toEqual({ id: "T-17", title: "Проверить сборку" });
    expect(JSON.parse(JSON.stringify(record))).toEqual({
      id: "T-17",
      title: "Проверить сборку"
    });
  });

  it("does not let a write replace id", () => {
    const record = createTaskRecord("T-17", "Проверить сборку");

    expect(Reflect.set(record, "id", "T-18")).toBe(false);
    expect(() => {
      record.id = "T-18";
    }).toThrow(TypeError);
    expect(record.id).toBe("T-17");
  });

  it("does not let deletion remove id", () => {
    const record = createTaskRecord("T-17", "Проверить сборку");

    expect(Reflect.deleteProperty(record, "id")).toBe(false);
    expect(() => {
      delete record.id;
    }).toThrow(TypeError);
    expect(Object.hasOwn(record, "id")).toBe(true);
    expect(record.id).toBe("T-17");
  });

  it("keeps title independently writable", () => {
    const record = createTaskRecord("T-17", "Проверить сборку");

    expect(Reflect.set(record, "title", "Проверить package")).toBe(true);
    expect(record.title).toBe("Проверить package");
    expect(Object.getOwnPropertyDescriptor(record, "title")).toEqual({
      value: "Проверить package",
      writable: true,
      enumerable: true,
      configurable: true
    });
  });

  it("does not restrict unrelated properties on the whole record", () => {
    const record = createTaskRecord("T-17", "Проверить сборку");

    expect(Reflect.set(record, "owner", "Ada")).toBe(true);
    expect(record.owner).toBe("Ada");
    expect(Reflect.deleteProperty(record, "owner")).toBe(true);
  });
});
