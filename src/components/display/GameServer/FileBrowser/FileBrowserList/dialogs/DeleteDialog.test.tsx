import { render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";
import { DeleteDialog } from "./DeleteDialog";

const t = ((key: string) => key) as unknown as TFunction<
  "translation",
  "components.fileBrowser.fileBrowserList"
>;

describe("DeleteDialog", () => {
  it("focuses the delete button on open so Enter confirms", async () => {
    render(
      <DeleteDialog
        open
        onOpenChange={vi.fn()}
        obj={{ name: "server.log", type: "FILE" }}
        busy={false}
        error={null}
        t={t}
        onSubmit={vi.fn()}
      />,
    );

    const deleteButton = await screen.findByTestId("delete-submit-btn");
    await vi.waitFor(() => expect(document.activeElement).toBe(deleteButton));
  });
});
