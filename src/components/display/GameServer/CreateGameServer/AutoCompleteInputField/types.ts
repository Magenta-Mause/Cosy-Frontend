import type * as React from "react";
import type { GameServerCreationFormState } from "../CreateGameServerModal";

export type GameServerCreationValue = Exclude<
  GameServerCreationFormState[keyof GameServerCreationFormState],
  undefined
>;

export type AutoCompleteItem<T, U extends GameServerCreationValue> = {
  data: T;
  value: U;
  label: string;
  additionalInformation?: string;
  leftSlot?: React.ReactNode;
};

// biome-ignore lint/suspicious/noExplicitAny: beep boop
export type AutoCompleteSelections = Record<string, AutoCompleteItem<any, any>>;

export interface AutoCompleteInputFieldProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  attribute?: keyof GameServerCreationFormState;
  selectionKey?: string;
  validator?: (value: TAutoCompleteData) => boolean;
  placeholder: string;
  fallbackValue: TAutoCompleteData;
  onItemSelect?: (
    item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>,
    updatedSelections: AutoCompleteSelections,
  ) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => React.ReactNode;
  noAutoCompleteItemsLabel?: string;
  searchId?: string;
  searchCallback: (
    searchValue: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
  disableDebounce?: boolean;
  disableCache?: boolean;
  defaultOpen?: boolean;
  description?: React.ReactNode;
  label?: React.ReactNode;
  alwaysIncludeFallback?: boolean;
}
