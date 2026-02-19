import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WebhookDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

interface WebhookSliceState extends SliceState<WebhookDto> {
  byGameServer: Record<string, string[]>;
}

const webhookSlice = createSlice({
  name: "webhook-slice",
  initialState: {
    data: [],
    state: "idle",
    byGameServer: {},
  } as WebhookSliceState,
  reducers: {
    setWebhooks: (
      state,
      action: PayloadAction<{ gameServerUuid: string; webhooks: WebhookDto[] }>,
    ) => {
      const { gameServerUuid, webhooks } = action.payload;
      state.data = webhooks;
      state.byGameServer[gameServerUuid] = webhooks.map((w) => w.uuid ?? "");
    },
    addWebhook: (state, action: PayloadAction<WebhookDto>) => {
      state.data.push(action.payload);
    },
    updateWebhook: (state, action: PayloadAction<WebhookDto>) => {
      const index = state.data.findIndex((w) => w.uuid === action.payload.uuid);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    removeWebhook: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((webhook) => webhook.uuid !== action.payload);
    },
    resetWebhooks: (state) => {
      state.data = [];
      state.byGameServer = {};
    },
    setState: (state, action: PayloadAction<WebhookSliceState["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const webhookSliceActions = webhookSlice.actions;
export const webhookSliceReducer = webhookSlice.reducer;
