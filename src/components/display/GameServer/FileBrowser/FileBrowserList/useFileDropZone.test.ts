import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFileDropZone } from "./useFileDropZone";

const dragEvent = () => {
  const target = document.createElement("div");
  return {
    target,
    preventDefault: vi.fn(),
    dataTransfer: { types: ["Files"], dropEffect: "none" },
  } as unknown as React.DragEvent;
};

const setup = () => {
  const onDropFiles = vi.fn();
  const hook = renderHook(() =>
    useFileDropZone({ currentPath: "/data", canDropAt: () => true, onDropFiles }),
  );
  const zone = () => hook.result.current.dropZoneProps;
  const enterAndHover = () =>
    act(() => {
      zone().onDragEnter(dragEvent());
      zone().onDragOver(dragEvent());
    });
  return { hook, zone, onDropFiles, enterAndHover };
};

const pressEscape = () =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });

describe("useFileDropZone", () => {
  it("uploads into the open directory on drop", () => {
    const { hook, zone, onDropFiles, enterAndHover } = setup();
    enterAndHover();
    expect(hook.result.current.isDroppingIntoCurrent).toBe(true);

    act(() => zone().onDrop(dragEvent()));
    expect(onDropFiles).toHaveBeenCalledWith("/data", expect.anything());
    expect(hook.result.current.isDragging).toBe(false);
  });

  it("hides the overlay and ignores the drop after Esc", () => {
    const { hook, zone, onDropFiles, enterAndHover } = setup();
    enterAndHover();
    pressEscape();
    expect(hook.result.current.isDragging).toBe(false);

    // Still hovering: further dragover must not bring the overlay back.
    const over = dragEvent();
    act(() => zone().onDragOver(over));
    expect(hook.result.current.isDragging).toBe(false);
    expect(over.dataTransfer.dropEffect).toBe("none");
    expect(over.preventDefault).toHaveBeenCalled();

    const drop = dragEvent();
    act(() => zone().onDrop(drop));
    expect(onDropFiles).not.toHaveBeenCalled();
    expect(drop.preventDefault).toHaveBeenCalled();
  });

  it("accepts the next drag after a cancelled one", () => {
    const { zone, onDropFiles, enterAndHover } = setup();
    enterAndHover();
    pressEscape();
    act(() => zone().onDragLeave(dragEvent()));

    enterAndHover();
    act(() => zone().onDrop(dragEvent()));
    expect(onDropFiles).toHaveBeenCalledTimes(1);
  });

  it("resets when the drag leaves without dropping", () => {
    const { hook, zone, onDropFiles, enterAndHover } = setup();
    enterAndHover();
    act(() => zone().onDragLeave(dragEvent()));
    expect(hook.result.current.isDragging).toBe(false);
    expect(hook.result.current.dropTarget).toBeNull();
    expect(onDropFiles).not.toHaveBeenCalled();
  });
});
