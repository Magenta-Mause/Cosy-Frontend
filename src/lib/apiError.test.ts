import { AxiosError, type AxiosResponse, CanceledError } from "axios";
import i18n from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import "@/i18n/i18n";
import {
  getApiErrorKey,
  getApiErrorMessage,
  getApiErrorReason,
  withApiErrorReason,
} from "./apiError";

const apiError = (status: number, data: unknown, errorCode?: string) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: { success: false, data, status_code: status, error_code: errorCode },
  } as AxiosResponse);

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("getApiErrorKey", () => {
  it("uses the backend error code", () => {
    expect(getApiErrorKey(apiError(400, "quota", "HARDWARE_QUOTA_EXCEEDED"))).toBe(
      "HARDWARE_QUOTA_EXCEEDED",
    );
  });

  it("falls back to the status without a code", () => {
    expect(getApiErrorKey(apiError(403, "Insufficient permissions"))).toBe("FORBIDDEN");
    expect(getApiErrorKey(apiError(500, "An unexpected error occurred."))).toBe("INTERNAL_ERROR");
  });

  it("falls back to the status for a code this build does not know", () => {
    expect(getApiErrorKey(apiError(404, "gone", "SOME_FUTURE_CODE"))).toBe("NOT_FOUND");
  });

  it("has no key for failures that only the backend text explains", () => {
    expect(
      getApiErrorKey(apiError(400, "Path escapes volume root", "BAD_REQUEST")),
    ).toBeUndefined();
    expect(getApiErrorKey(apiError(409, "nope", "CONFLICT"))).toBeUndefined();
  });

  it("tells a timeout from an unreachable server", () => {
    expect(getApiErrorKey(new AxiosError("timeout", "ECONNABORTED"))).toBe("TIMEOUT");
    expect(getApiErrorKey(new AxiosError("Network Error", "ERR_NETWORK"))).toBe("NETWORK");
  });

  it("ignores cancelled requests and non-request errors", () => {
    expect(getApiErrorKey(new CanceledError("Query was cancelled"))).toBeUndefined();
    expect(getApiErrorKey(new Error("boom"))).toBeUndefined();
  });

  it("handles a blob error body", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 413,
      data: new Blob(["{}"]),
    } as AxiosResponse);
    expect(getApiErrorKey(error)).toBe("PAYLOAD_TOO_LARGE");
  });
});

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

describe("getApiErrorReason", () => {
  it("translates a known failure", () => {
    expect(getApiErrorReason(apiError(409, "taken", "USERNAME_TAKEN"))).toBe(
      "This username is already taken.",
    );
  });

  it("is undefined for an unknown failure", () => {
    expect(getApiErrorReason(apiError(400, "Path escapes volume root"))).toBeUndefined();
  });
});

describe("withApiErrorReason", () => {
  it("appends the translated reason", () => {
    expect(withApiErrorReason("Could not save.", new AxiosError("x", "ERR_NETWORK"))).toBe(
      "Could not save. The server cannot be reached. Check your connection.",
    );
  });

  it("appends the backend text when there is no translation", () => {
    expect(withApiErrorReason("Could not save.", apiError(400, "Path escapes volume root"))).toBe(
      "Could not save. Path escapes volume root",
    );
  });

  it("leaves the message alone when nothing is known", () => {
    expect(withApiErrorReason("Could not save.", new Error("boom"))).toBe("Could not save.");
  });
});
