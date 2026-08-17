import { describe, expectTypeOf, it } from "vitest";

import type { EventEnvelope } from "./envelope.js";

describe("EventEnvelope type contract", () => {
  it("preserves the event payload type", () => {
    expectTypeOf<EventEnvelope<{ value: number }>["data"]>().toEqualTypeOf<{ value: number }>();
  });
});
