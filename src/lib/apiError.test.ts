import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage, getServerStartErrorKind } from "./apiError";

const apiError = (status: number, data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: { success: false, data, status_code: status },
  } as AxiosResponse);

describe("getApiErrorMessage", () => {
  it("returns the backend reason", () => {
    expect(getApiErrorMessage(apiError(409, "Server is already starting"))).toBe(
      "Server is already starting",
    );
  });

  it("returns the first field error of a validation response", () => {
    expect(getApiErrorMessage(apiError(400, { username: "must not be blank" }))).toBe(
      "must not be blank",
    );
  });

  it("returns undefined without a backend reason", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBeUndefined();
    expect(getApiErrorMessage(new AxiosError("Network Error"))).toBeUndefined();
    expect(getApiErrorMessage(apiError(500, undefined))).toBeUndefined();
  });
});

describe("getServerStartErrorKind", () => {
  it("recognises an exceeded hardware quota", () => {
    const error = apiError(
      400,
      "Hardware quota limit reached: Could not start Server - user Hardware limit was reached:\ncpu-cores: 3.00/2.00\nmemory: 6 GiB/4 GiB",
    );
    expect(getServerStartErrorKind(error)).toBe("quotaExceeded");
  });

  it("recognises a server without a resource limit", () => {
    const error = apiError(
      400,
      "Hardware quota limit reached: user has memory limit; so they can not start a game server which doesnt have a resource limit configured",
    );
    expect(getServerStartErrorKind(error)).toBe("missingResourceLimit");
  });

  it("falls back to generic", () => {
    expect(getServerStartErrorKind(apiError(409, "Server is already starting"))).toBe("generic");
    expect(getServerStartErrorKind(new Error("boom"))).toBe("generic");
  });
});
