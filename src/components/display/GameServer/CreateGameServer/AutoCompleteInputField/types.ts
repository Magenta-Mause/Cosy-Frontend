import type * as React from "react";
import type { GameServerCreationDto } from "@/api/generated/model";

export type GameServerCreationValue = Exclude<
  GameServerCreationDto[keyof GameServerCreationDto],
  undefined
>;

export type AutoCompleteItem<T, U extends GameServerCreationValue> = {
  data: T;
  value: U;
  label: string;
  additionalInformation?: string;
  leftSlot?: React.ReactNode;
};

export interface AutoCompleteInputFieldProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  attribute: keyof GameServerCreationDto | "template";
  validator: (value: TAutoCompleteData) => boolean;
  placeholder: string;
  fallbackValue: TAutoCompleteData;
  onItemSelect?: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => React.ReactNode;
  noAutoCompleteItemsLabel?: string;
  searchId?: string;
  searchCallback: (
    searchValue: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
  disableDebounce?: boolean;
  defaultOpen?: boolean;
  description?: React.ReactNode;
  label?: React.ReactNode;
}
