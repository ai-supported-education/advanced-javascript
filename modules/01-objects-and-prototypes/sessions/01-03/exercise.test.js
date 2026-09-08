import { describe, expect, it } from "vitest";
import { manualNew } from "./exercise.js";

describe("manualNew observable construction behavior", () => {
  it("links the receiver to Constructor.prototype and passes arguments", () => {
    function Ticket(id, priority) {
      this.id = id;
      this.priority = priority;
    }
    Ticket.prototype.label = function label() {
      return `${this.id}:${this.priority}`;
    };

    const ticket = manualNew(Ticket, ["T-17", "high"]);

    expect(Object.getPrototypeOf(ticket)).toBe(Ticket.prototype);
    expect(ticket).toEqual({ id: "T-17", priority: "high" });
    expect(ticket.label()).toBe("T-17:high");
    expect(Object.hasOwn(ticket, "label")).toBe(false);
  });

  it("uses Object.prototype when Constructor.prototype is not an object", () => {
    function Record() {
      this.ready = true;
    }
    Record.prototype = 7;

    const record = manualNew(Record);

    expect(Object.getPrototypeOf(record)).toBe(Object.prototype);
    expect(record.ready).toBe(true);
  });

  it("calls Constructor exactly once and returns that receiver", () => {
    let callCount = 0;
    let receivedThis;

    function SingleCall(value) {
      callCount += 1;
      receivedThis = this;
      this.value = value;
      return "primitive result";
    }

    const result = manualNew(SingleCall, ["payload"]);

    expect(callCount).toBe(1);
    expect(result).toBe(receivedThis);
    expect(result.value).toBe("payload");
  });

  it.each([0, 42, "replacement", true, null, undefined])(
    "keeps the receiver when constructor returns primitive %j",
    (primitive) => {
      let receivedThis;

      function PrimitiveResult() {
        receivedThis = this;
        this.kept = true;
        return primitive;
      }

      const result = manualNew(PrimitiveResult);

      expect(result).toBe(receivedThis);
      expect(result.kept).toBe(true);
      expect(Object.getPrototypeOf(result)).toBe(PrimitiveResult.prototype);
    }
  );

  it("keeps the receiver when constructor returns a symbol", () => {
    function SymbolResult() {
      this.kept = true;
      return Symbol("replacement");
    }

    expect(manualNew(SymbolResult).kept).toBe(true);
  });

  it("keeps the receiver when constructor returns a bigint", () => {
    function BigIntResult() {
      this.kept = true;
      return 1n;
    }

    expect(manualNew(BigIntResult).kept).toBe(true);
  });

  it("uses an explicitly returned object without copying it", () => {
    const replacement = Object.create(null);
    replacement.source = "explicit";

    function ObjectResult() {
      this.discarded = true;
      return replacement;
    }

    const result = manualNew(ObjectResult);

    expect(result).toBe(replacement);
    expect(result.source).toBe("explicit");
    expect(Object.hasOwn(result, "discarded")).toBe(false);
  });

  it("uses an explicitly returned function", () => {
    const plugin = () => "ready";

    function FunctionResult() {
      return plugin;
    }

    const result = manualNew(FunctionResult);

    expect(result).toBe(plugin);
    expect(result()).toBe("ready");
  });
});
