import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import enUS from "@/i18n/en-US/translation";
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

const renderPreview = async (fileName: string, blob: Blob) => {
  const view = render(
    <I18nextProvider i18n={i18n}>
      <FilePreview fileName={fileName} blob={blob} />
    </I18nextProvider>,
  );
  // Let the async text decode settle.
  await act(async () => {});
  return view;
};

describe("FilePreview", () => {
  it("offers no mode picker when the extension identifies the file", async () => {
    await renderPreview("server.properties", new Blob(["motd=hi"]));

    expect(screen.queryByTestId("file-preview-mode")).toBeNull();
    expect(screen.getByText("motd=hi")).toBeTruthy();
  });

  it("shows a file without an extension as text and lets the user pick another mode", async () => {
    const { container } = await renderPreview("whitelist", new Blob(["steve"]));

    expect(screen.getByTestId("file-preview-mode")).toBeTruthy();
    expect(screen.getByText("steve")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId("file-preview-mode-audio"));
    });
    expect(container.querySelector("audio")?.getAttribute("src")).toBe("blob:preview");

    await act(async () => {
      fireEvent.click(screen.getByTestId("file-preview-mode-image"));
    });
    const img = container.querySelector("img");
    expect(img).toBeTruthy();

    // A file the browser can't decode as the chosen type says so instead of a broken image.
    await act(async () => {
      if (img) fireEvent.error(img);
    });
    expect(screen.getByText("This file can't be displayed as Image")).toBeTruthy();

    // Switching mode clears that error.
    await act(async () => {
      fireEvent.click(screen.getByTestId("file-preview-mode-video"));
    });
    expect(container.querySelector("video")).toBeTruthy();
  });

  it("shows binary content as text when the user explicitly picks text", async () => {
    await renderPreview("level", new Blob([new Uint8Array([0x00, 0x41, 0x42])]));
    expect(screen.getByText(/No preview available/)).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId("file-preview-mode-text"));
    });
    expect(screen.getByText(/AB/)).toBeTruthy();
  });
});
