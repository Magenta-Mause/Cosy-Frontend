import {Label} from "@components/ui/label";
import type {ReactNode} from "react";
import type {AutoCompleteItem, GameServerCreationValue} from "./types";

interface AutoCompleteItemRowProps<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>;
  index: number;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (index: number) => void;
  onLeave: () => void;
}

function AutoCompleteItemRow<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  item,
  index,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: AutoCompleteItemRowProps<TSelectedItem, TAutoCompleteData>) {
  return (
    <div
      role="option"
      aria-selected={isHovered}
      className={
        "flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm " +
        (isHovered ? "bg-accent text-accent-foreground" : "")
      }
      onClick={onSelect}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
    >
      {item.leftSlot && <div className="shrink-0 mr-2">{item.leftSlot}</div>}
      <Label className="text-xl flex justify-between w-full cursor-pointer">
        <p className="text-ellipsis">{item.label}</p>
        {item.additionalInformation && (
          <p className="opacity-50">{item.additionalInformation}</p>
        )}
      </Label>
    </div>
  );
}

interface AutoCompleteItemListProps<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  items: AutoCompleteItem<TSelectedItem, TAutoCompleteData>[] | undefined;
  isLoading: boolean;
  isError: boolean;
  hoveredIndex: number | null;
  loadingLabel: string;
  fallbackValue: TAutoCompleteData;
  noItemsLabel?: string;
  noItemsLabelRenderer?: (displayValue: string) => ReactNode;
  displayValue: string;
  onSelectItem: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  onHoverItem: (index: number) => void;
  onLeaveItem: () => void;
  maxItems?: number;
}

function AutoCompleteItemList<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  items,
  isLoading,
  isError,
  hoveredIndex,
  loadingLabel,
  fallbackValue,
  noItemsLabel,
  noItemsLabelRenderer,
  displayValue,
  onSelectItem,
  onHoverItem,
  onLeaveItem,
  maxItems = 5,
}: AutoCompleteItemListProps<TSelectedItem, TAutoCompleteData>) {
  if (isLoading) {
    return (
      <div className="px-2 py-1.5 text-sm text-muted-foreground">
        {loadingLabel}
      </div>
    );
  }

  if (!isError && items && items.length > 0) {
    return (
      <div role="listbox" className="flex flex-col gap-0.5">
        {items.slice(0, maxItems).map((item, index) => (
          <AutoCompleteItemRow
            key={item.value.toString()}
            item={item}
            index={index}
            isHovered={hoveredIndex === index}
            onSelect={() => onSelectItem(item)}
            onHover={onHoverItem}
            onLeave={onLeaveItem}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="option"
      className="flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground"
      onClick={() =>
        onSelectItem({
          value: fallbackValue,
          label: noItemsLabel ?? "No Items found",
        } as AutoCompleteItem<TSelectedItem, TAutoCompleteData>)
      }
    >
      {noItemsLabelRenderer?.(displayValue) ?? (
        <Label className="cursor-pointer">{noItemsLabel ?? "No items found"}</Label>
      )}
    </div>
  );
}

export default AutoCompleteItemList;
