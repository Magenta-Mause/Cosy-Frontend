import { describe, expect, it } from "vitest";
import { blobToTextIfLikely, PREVIEW_MODES, previewModeForExt } from "@/lib/fileSystemUtils";

describe("previewModeForExt", () => {
  it.each([
    ["png", "image"],
    ["svg", "image"],
    ["mp4", "video"],
    ["mp3", "audio"],
    ["flac", "audio"],
    ["properties", "text"],
    ["json", "text"],
  ] as const)("maps .%s to %s", (ext, mode) => {
    expect(previewModeForExt(ext)).toBe(mode);
  });

  it("returns null when the extension doesn't say", () => {
    expect(previewModeForExt("")).toBeNull();
    expect(previewModeForExt("dat")).toBeNull();
  });

  it("only returns modes the picker offers", () => {
    for (const ext of ["png", "mp4", "mp3", "txt"]) {
      expect(PREVIEW_MODES).toContain(previewModeForExt(ext));
    }
  });
});

describe("blobToTextIfLikely", () => {
  const binary = new Blob([new Uint8Array([0x89, 0x50, 0x00, 0xff, 0x41])]);

  it("decodes plain text", async () => {
    expect(await blobToTextIfLikely(new Blob(["level-name=world\n"]))).toEqual({
      ok: true,
      text: "level-name=world\n",
    });
  });

  it("refuses content that looks binary", async () => {
    expect((await blobToTextIfLikely(binary)).ok).toBe(false);
  });

  it("decodes binary-looking content when forced", async () => {
    expect((await blobToTextIfLikely(binary, { force: true })).ok).toBe(true);
  });

  it("refuses files over 16KB even when forced", async () => {
    const big = new Blob(["a".repeat(16 * 1024 + 1)]);
    expect((await blobToTextIfLikely(big, { force: true })).ok).toBe(false);
  });
});
