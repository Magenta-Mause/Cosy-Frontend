import { Label } from "@components/ui/label";
import type { ReactNode } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import type { AutoCompleteItem, GameServerCreationValue } from "./types";

interface AutoCompleteItemRowProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (index: number) => void;
}

function AutoCompleteItemRow<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  item,
  index,
  isSelected,
  onSelect,
  onHover,
}: AutoCompleteItemRowProps<TSelectedItem, TAutoCompleteData>) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      className={
        "flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm " +
        (isSelected ? "bg-accent text-accent-foreground" : "")
      }
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      onMouseEnter={() => onHover(index)}
    >
      {item.leftSlot && <div className="shrink-0 mr-2">{item.leftSlot}</div>}
      <Label className="text-xl flex justify-between w-full cursor-pointer">
        <p className="text-ellipsis">{item.label}</p>
        {item.additionalInformation && <p className="opacity-50">{item.additionalInformation}</p>}
      </Label>
    </div>
  );
}

interface FallbackItemRowProps {
  label: string;
  labelRenderer?: (displayValue: string) => ReactNode;
  displayValue: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (index: number) => void;
}

function FallbackItemRow({
  label,
  labelRenderer,
  displayValue,
  index,
  isSelected,
  onSelect,
  onHover,
}: FallbackItemRowProps) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      className={
        "flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm " +
        (isSelected ? "bg-accent text-accent-foreground" : "")
      }
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      onMouseEnter={() => onHover(index)}
    >
      {labelRenderer?.(displayValue) ?? (
        <Label className="text-xl flex justify-between w-full cursor-pointer opacity-70">
          <p className="text-ellipsis text-xl">{label}</p>
        </Label>
      )}
    </div>
  );
}

interface AutoCompleteItemListProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  items: AutoCompleteItem<TSelectedItem, TAutoCompleteData>[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedIndex: number;
  loadingLabel: string;
  fallbackValue: TAutoCompleteData;
  noItemsLabel?: string;
  noItemsLabelRenderer?: (displayValue: string) => ReactNode;
  displayValue: string;
  onSelectItem: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  onHoverItem: (index: number) => void;
  maxItems?: number;
  alwaysIncludeFallback?: boolean;
}

function AutoCompleteItemList<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  items,
  isLoading,
  isError,
  selectedIndex,
  loadingLabel,
  fallbackValue,
  noItemsLabel,
  noItemsLabelRenderer,
  displayValue,
  onSelectItem,
  onHoverItem,
  maxItems = 5,
  alwaysIncludeFallback = false,
}: AutoCompleteItemListProps<TSelectedItem, TAutoCompleteData>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  if (isLoading) {
    return <div className="px-2 py-1.5 text-sm text-muted-foreground">{loadingLabel}</div>;
  }

  const handleFallbackSelect = () =>
    onSelectItem({
      value: fallbackValue,
      label: noItemsLabel ?? t("noResultsLabel"),
    } as AutoCompleteItem<TSelectedItem, TAutoCompleteData>);

  const fallbackLabel = noItemsLabel ?? t("noResultsLabel");

  if (isError || !items || items.length === 0) {
    return (
      <FallbackItemRow
        label={fallbackLabel}
        labelRenderer={noItemsLabelRenderer}
        displayValue={displayValue}
        index={0}
        isSelected={false}
        onSelect={handleFallbackSelect}
        onHover={onHoverItem}
      />
    );
  }

  const visibleItems = items.slice(0, maxItems);
  return (
    <div role="listbox" className="flex flex-col gap-0.5">
      {visibleItems.map((item, index) => (
        <AutoCompleteItemRow
          key={item.value.toString()}
          item={item}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={() => onSelectItem(item)}
          onHover={onHoverItem}
        />
      ))}
      {alwaysIncludeFallback && (
        <FallbackItemRow
          label={fallbackLabel}
          labelRenderer={noItemsLabelRenderer}
          displayValue={displayValue}
          index={visibleItems.length}
          isSelected={selectedIndex === visibleItems.length}
          onSelect={handleFallbackSelect}
          onHover={onHoverItem}
        />
      )}
    </div>
  );
}

export default AutoCompleteItemList;
