import { describe, expect, it } from "vitest";
import { Counter } from "./exercise.js";

describe("Counter prototype method", () => {
  it("keeps state on the receiving instance", () => {
    const first = new Counter(1);
    const second = new Counter(10);

    expect(first.increment()).toBe(2);
    expect(first.value).toBe(2);
    expect(second.value).toBe(10);
  });

  it("shares one inherited method between instances", () => {
    const first = new Counter();
    const second = new Counter();

    expect(Object.hasOwn(first, "increment")).toBe(false);
    expect(Object.hasOwn(second, "increment")).toBe(false);
    expect(Object.hasOwn(Counter.prototype, "increment")).toBe(true);
    expect(first.increment).toBe(Counter.prototype.increment);
    expect(first.increment).toBe(second.increment);
  });

  it("uses an explicitly supplied receiver", () => {
    const receiver = { value: 40 };

    expect(Counter.prototype.increment.call(receiver)).toBe(41);
    expect(receiver.value).toBe(41);
  });
});
