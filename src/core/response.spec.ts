import { describe, expect, it } from "vitest";
import { ApiClientError, ensureSuccess, unwrap, unwrapOrNull } from "./response";

const failure = {
  success: false as const,
  error: {
    message: "Insufficient inventory for variant 9: requested 2, available 1",
    statusCode: 409,
    error: "INSUFFICIENT_INVENTORY",
    details: { items: [{ variant_id: 9, requested: 2, available: 1 }] },
  },
};

describe("business error details", () => {
  it("unwrap carries code and details onto ApiClientError", () => {
    try {
      unwrap(failure);
      throw new Error("unwrap did not throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error).toMatchObject({
        statusCode: 409,
        code: "INSUFFICIENT_INVENTORY",
        details: { items: [{ variant_id: 9, requested: 2, available: 1 }] },
      });
    }
  });

  it("unwrapOrNull and ensureSuccess carry details too", () => {
    expect(() => unwrapOrNull(failure)).toThrow(
      expect.objectContaining({ details: failure.error.details }),
    );
    expect(() => ensureSuccess(failure)).toThrow(
      expect.objectContaining({ details: failure.error.details }),
    );
  });

  it("leaves details undefined when the error has none", () => {
    const error = new ApiClientError("nope", 500, "X");
    expect(error.details).toBeUndefined();
  });
});
