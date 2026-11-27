import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "i18next";
import { useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import enUS from "@/i18n/en-US/translation";
import type { PreviewMode } from "@/lib/fileSystemUtils";
import { FilePreview } from "./FilePreview";

// jsdom implements neither object URLs nor media playback; the preview only needs a URL.
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

beforeAll(async () => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: enUS } },
    interpolation: { escapeValue: false },
  });
});

afterAll(() => {
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
});

afterEach(cleanup);

const renderPreview = async (
  fileName: string,
  blob: Blob,
  modeOverride: PreviewMode | null = null,
) => {
  const ui = (mode: PreviewMode | null) => (
    <I18nextProvider i18n={i18n}>
      <FilePreview fileName={fileName} blob={blob} modeOverride={mode} />
    </I18nextProvider>
  );
  const view = render(ui(modeOverride));
  // Let the async text decode settle.
  await act(async () => {});
  return {
    ...view,
    openAs: async (mode: PreviewMode | null) => {
      view.rerender(ui(mode));
      await act(async () => {});
    },
  };
};

// Mirrors the dialog: the inline picker writes the same override the ⋯ menu does.
const WithPicker = ({ fileName, blob }: { fileName: string; blob: Blob }) => {
  const [mode, setMode] = useState<PreviewMode | null>(null);
  return (
    <I18nextProvider i18n={i18n}>
      <FilePreview fileName={fileName} blob={blob} modeOverride={mode} onModeChange={setMode} />
    </I18nextProvider>
  );
};

const renderWithPicker = async (fileName: string, blob: Blob) => {
  const view = render(<WithPicker fileName={fileName} blob={blob} />);
  await act(async () => {});
  return view;
};

const pick = async (mode: PreviewMode) => {
  await act(async () => {
    fireEvent.click(screen.getByTestId(`file-preview-mode-${mode}`));
  });
};

describe("FilePreview inline picker", () => {
  it("is offered only when the extension doesn't identify the file", async () => {
    await renderWithPicker("server.properties", new Blob(["motd=hi"]));
    expect(screen.queryByTestId("file-preview-mode")).toBeNull();

    cleanup();
    await renderWithPicker("whitelist", new Blob(["steve"]));
    expect(screen.getByTestId("file-preview-mode")).toBeTruthy();
    expect(screen.getByText("steve")).toBeTruthy();
  });

  it("switches how the file is shown", async () => {
    const { container } = await renderWithPicker("whitelist", new Blob(["steve"]));

    await pick("audio");
    expect(container.querySelector("audio")?.getAttribute("src")).toBe("blob:preview");
  });

  it("forces text when the already-active Text option is clicked", async () => {
    await renderWithPicker("level", new Blob([new Uint8Array([0x00, 0x41, 0x42])]));
    expect(screen.getByText(/No preview available/)).toBeTruthy();
    // The picker is right there, so no pointer to the ⋯ menu.
    expect(screen.queryByText(/Open as/)).toBeNull();

    await pick("text");
    expect(screen.getByText(/AB/)).toBeTruthy();
  });
});

describe("FilePreview", () => {
  it("renders from the extension when nothing is overridden", async () => {
    await renderPreview("server.properties", new Blob(["motd=hi"]));

    expect(screen.getByText("motd=hi")).toBeTruthy();
  });

  it("points to Open as when a file without an extension isn't text", async () => {
    await renderPreview("level", new Blob([new Uint8Array([0x00, 0x41, 0x42])]));

    // One sentence, not two strings glued together.
    expect(
      screen.getByText(
        'No preview available (Content doesn\'t look like plain text). To show it another way, choose "Open as" in the file\'s "..." menu.',
      ),
    ).toBeTruthy();
  });

  it("overrides a recognised extension", async () => {
    const { container } = await renderPreview("clip.txt", new Blob(["x"]), "audio");

    expect(container.querySelector("audio")?.getAttribute("src")).toBe("blob:preview");
  });

  it("keeps media hidden until the browser has decoded it", async () => {
    const { container } = await renderPreview("whitelist", new Blob(["steve"]), "video");
    const video = container.querySelector("video") as HTMLVideoElement;

    expect(video.className).toContain("hidden");
    expect(screen.getByText("Loading preview...")).toBeTruthy();

    await act(async () => {
      fireEvent.loadedMetadata(video);
    });
    expect(video.className).not.toContain("hidden");
    expect(screen.queryByText("Loading preview...")).toBeNull();
  });

  it("says so, without ever showing the element, when the file isn't the chosen type", async () => {
    const { container, openAs } = await renderPreview("whitelist", new Blob(["steve"]), "image");
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.className).toContain("hidden");

    await act(async () => {
      fireEvent.error(img);
    });
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("This file can't be displayed as Image")).toBeTruthy();

    // Choosing another type starts over instead of carrying the failure along.
    await openAs("video");
    expect(container.querySelector("video")).toBeTruthy();
    expect(screen.queryByText(/can't be displayed/)).toBeNull();
  });

  it("shows binary content as text when the user explicitly picks text", async () => {
    const { openAs } = await renderPreview("level", new Blob([new Uint8Array([0x00, 0x41, 0x42])]));
    expect(screen.getByText(/No preview available/)).toBeTruthy();

    await openAs("text");
    expect(screen.getByText(/AB/)).toBeTruthy();
  });
});
