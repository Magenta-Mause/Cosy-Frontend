import { describe, expect, it } from "vitest";
import { isFileDrag, isPathInVolumes, planDropUpload } from "@/lib/droppedFiles";

const file = (name: string) => new File(["x"], name);

describe("planDropUpload", () => {
  it("puts loose files directly into the target directory", () => {
    const a = file("a.txt");
    const plan = planDropUpload("/data", { files: [{ relativePath: "a.txt", file: a }], directories: [] });
    expect(plan.directories).toEqual([]);
    expect(plan.files).toEqual([{ path: "/data/a.txt", file: a }]);
  });

  it("creates parent directories before children, including empty folders", () => {
    const plan = planDropUpload("/data/", {
      files: [{ relativePath: "world/region/r.0.0.mca", file: file("r.0.0.mca") }],
      directories: ["world", "world/region", "world/empty"],
    });
    expect(plan.directories).toEqual(["/data/world", "/data/world/empty", "/data/world/region"]);
    expect(plan.files.map((f) => f.path)).toEqual(["/data/world/region/r.0.0.mca"]);
  });

  it("derives missing parent directories from file paths", () => {
    const plan = planDropUpload("/", {
      files: [{ relativePath: "a/b/c.txt", file: file("c.txt") }],
      directories: [],
    });
    expect(plan.directories).toEqual(["/a", "/a/b"]);
    expect(plan.files[0]?.path).toBe("/a/b/c.txt");
  });
});

describe("isPathInVolumes", () => {
  const volumes = [{ container_path: "/data" }, { container_path: "/config/" }];

  it("accepts the volume root and anything below it", () => {
    expect(isPathInVolumes("/data", volumes)).toBe(true);
    expect(isPathInVolumes("/data/world", volumes)).toBe(true);
    expect(isPathInVolumes("/config/x", volumes)).toBe(true);
  });

  it("rejects synthetic parents and look-alike siblings", () => {
    expect(isPathInVolumes("/", volumes)).toBe(false);
    expect(isPathInVolumes("/data2", volumes)).toBe(false);
    expect(isPathInVolumes("/data", undefined)).toBe(false);
  });
});

describe("isFileDrag", () => {
  it("only reacts to drags that carry files", () => {
    expect(isFileDrag({ types: ["Files"] } as unknown as DataTransfer)).toBe(true);
    expect(isFileDrag({ types: ["text/plain"] } as unknown as DataTransfer)).toBe(false);
    expect(isFileDrag(null)).toBe(false);
  });
});
