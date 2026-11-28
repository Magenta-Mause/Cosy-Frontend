import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  createDirectoryInVolume: vi.fn(),
  getFileSystemForVolume: vi.fn(),
  uploadFileToVolume: vi.fn(),
}));
const dropped = vi.hoisted(() => ({ collectDroppedItems: vi.fn() }));
const notify = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn(), success: vi.fn() }));

vi.mock("@/api/generated/backend-api", () => ({
  ...api,
  readFileFromVolume: vi.fn(),
  setPermissions: vi.fn(),
  uploadArchiveToVolume: vi.fn(),
  useCreateDirectoryInVolume: () => ({ mutateAsync: vi.fn() }),
  useDeleteInVolume: () => ({ mutateAsync: vi.fn() }),
  useRenameInVolume: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/lib/droppedFiles", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/droppedFiles")>()),
  ...dropped,
}));
vi.mock("@/lib/notificationModal", () => ({ notificationModal: notify }));

import { useFileBrowserActions } from "./useFileBrowserActions";

const file = (name: string) => new File(["x"], name);
const dataTransfer = {} as DataTransfer;

const setup = () => {
  const ensurePathFetched = vi.fn().mockResolvedValue(undefined);
  const invalidatePathsUnder = vi.fn();
  const hook = renderHook(() =>
    useFileBrowserActions({
      serverUuid: "srv",
      currentPath: "/data",
      fetchDepth: 1,
      ensurePathFetched,
      invalidatePathsUnder,
      setSelectedFilePath: vi.fn(),
      setSelectedFileName: vi.fn(),
      closePreview: vi.fn(),
      t: ((key: string) => key) as never,
    }),
  );
  return { hook, ensurePathFetched, invalidatePathsUnder };
};

/** A promise the test resolves by hand, to hold the upload at a given step. */
const deferred = <T>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

beforeEach(() => {
  vi.clearAllMocks();
  api.getFileSystemForVolume.mockResolvedValue({ objects: [] });
  api.uploadFileToVolume.mockResolvedValue(undefined);
  api.createDirectoryInVolume.mockResolvedValue(undefined);
});

describe("useFileBrowserActions.uploadDropped", () => {
  it("is busy while the drop is being read and rejects a second drop with an error", async () => {
    const reading = deferred<{ files: never[]; directories: string[] }>();
    dropped.collectDroppedItems.mockReturnValueOnce(reading.promise);
    const { hook } = setup();

    let run!: Promise<void>;
    act(() => {
      run = hook.result.current.uploadDropped("/data", dataTransfer);
    });
    expect(hook.result.current.uploadState).toEqual({ phase: "preparing" });

    await act(() => hook.result.current.uploadDropped("/data", dataTransfer));
    expect(notify.error).toHaveBeenCalledWith({ message: "dropWhileUploadingError" });
    expect(dropped.collectDroppedItems).toHaveBeenCalledTimes(1);

    await act(async () => {
      reading.resolve({ files: [], directories: [] });
      await run;
    });
    expect(hook.result.current.uploadState).toBeNull();
  });

  it("asks before overwriting and uploads nothing when declined", async () => {
    dropped.collectDroppedItems.mockResolvedValue({
      files: [{ relativePath: "world/level.dat", file: file("level.dat") }],
      directories: ["world"],
    });
    api.getFileSystemForVolume.mockResolvedValue({
      objects: [{ name: "world", type: "DIRECTORY" }],
    });
    const { hook, ensurePathFetched } = setup();

    let run!: Promise<void>;
    act(() => {
      run = hook.result.current.uploadDropped("/data", dataTransfer);
    });
    await waitFor(() => expect(hook.result.current.pendingDropConfirm).not.toBeNull());
    expect(hook.result.current.pendingDropConfirm?.clashes).toEqual([
      { name: "world", isDirectory: true },
    ]);

    await act(async () => {
      hook.result.current.pendingDropConfirm?.resolve(false);
      await run;
    });
    expect(api.uploadFileToVolume).not.toHaveBeenCalled();
    expect(api.createDirectoryInVolume).not.toHaveBeenCalled();
    expect(ensurePathFetched).not.toHaveBeenCalled();
    expect(hook.result.current.pendingDropConfirm).toBeNull();
  });

  it("stops after the current file when cancelled and refreshes what was touched", async () => {
    dropped.collectDroppedItems.mockResolvedValue({
      files: ["a", "b", "c"].map((n) => ({ relativePath: `${n}.txt`, file: file(n) })),
      directories: [],
    });
    const first = deferred<void>();
    api.uploadFileToVolume.mockReturnValueOnce(first.promise);
    const { hook, ensurePathFetched, invalidatePathsUnder } = setup();

    let run!: Promise<void>;
    act(() => {
      run = hook.result.current.uploadDropped("/data", dataTransfer);
    });
    await waitFor(() => expect(api.uploadFileToVolume).toHaveBeenCalledTimes(1));

    act(() => hook.result.current.cancelUpload());
    expect(hook.result.current.uploadState).toMatchObject({ phase: "uploading", cancelling: true });

    await act(async () => {
      first.resolve();
      await run;
    });
    expect(api.uploadFileToVolume).toHaveBeenCalledTimes(1);
    expect(notify.info).toHaveBeenCalledWith({ message: "dropUploadCancelled" });
    expect(invalidatePathsUnder).toHaveBeenCalledWith("/data");
    expect(ensurePathFetched).toHaveBeenCalledWith("/data", 1, true);
    expect(hook.result.current.uploadState).toBeNull();
  });

  it("does not leak a rejection when the final refresh fails", async () => {
    dropped.collectDroppedItems.mockResolvedValue({
      files: [{ relativePath: "a.txt", file: file("a") }],
      directories: [],
    });
    const { hook, ensurePathFetched } = setup();
    ensurePathFetched.mockRejectedValue(new Error("offline"));

    await act(async () => {
      await expect(
        hook.result.current.uploadDropped("/data", dataTransfer),
      ).resolves.toBeUndefined();
    });
  });
});
