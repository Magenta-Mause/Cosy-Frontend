import {FieldLabel} from "@components/ui/field.tsx";
import {Input} from "@components/ui/input";
import {Label} from "@components/ui/label";
import {Command, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import type {AutoCompleteInputFieldProps, GameServerCreationValue} from "./types";
import {useAutoComplete} from "./useAutoComplete";

function AutoCompleteInputField<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  validator,
  placeholder,
  onItemSelect,
  noAutoCompleteItemsLabelRenderer,
  noAutoCompleteItemsLabel,
  fallbackValue,
  searchId,
  searchCallback,
  disableDebounce,
  defaultOpen,
  description,
  label,
}: AutoCompleteInputFieldProps<TSelectedItem, TAutoCompleteData>) {
  const {t} = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  const {
    open,
    setOpen,
    displayName,
    isLoading,
    isError,
    autoCompleteItems,
    hoveredIndex,
    commandRef,
    inputRef,
    selectItem,
    handleInputChange,
    handleInputKeyDown,
    handleItemHover,
    handleItemLeave,
  } = useAutoComplete({
    attribute,
    validator,
    searchId,
    searchCallback,
    disableDebounce,
    onItemSelect,
  });

  return (
    <Popover open={open}>
      <PopoverTrigger tabIndex={-1}>
        <div className="w-full">
          {label && (
            <FieldLabel htmlFor={attribute} className={"text-lg"}>
              {label}
            </FieldLabel>
          )}
          <Input
            ref={inputRef}
            placeholder={placeholder}
            id={attribute}
            value={displayName}
            onClick={() => defaultOpen && setOpen(true)}
            onFocus={() => defaultOpen && setOpen(true)}
            onChange={(e) => handleInputChange(e.target.value)}
            autoComplete="off"
            onKeyDown={handleInputKeyDown}
            className={"w-full"}
          />
          {description && <FieldLabel htmlFor={attribute}>{description}</FieldLabel>}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[35vw]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div data-loading={isLoading}>
          <Command ref={commandRef}>
            <CommandList>
              {isLoading ? (
                <CommandItem key="loading" disabled>
                  <p>{t("loadingLabel")}</p>
                </CommandItem>
              ) : !isError && autoCompleteItems && autoCompleteItems.length > 0 ? (
                autoCompleteItems.slice(0, 5).map((item, index) => (
                  <CommandItem
                    key={item.value.toString()}
                    onSelect={() => selectItem(item)}
                    onMouseEnter={() => handleItemHover(index)}
                    onMouseLeave={handleItemLeave}
                    className={
                      "flex-auto items-center " + (hoveredIndex === index ? "bg-gray-100" : "")
                    }
                  >
                    <div className="shrink-0">{item.leftSlot}</div>
                    <Label className="text-xl flex justify-between w-full">
                      <p className={"text-ellipsis"}>{item.label}</p>
                      {item.additionalInformation && (
                        <p className={"opacity-50"}>{item.additionalInformation}</p>
                      )}
                    </Label>
                  </CommandItem>
                ))
              ) : (
                <CommandItem
                  key="unknown-item"
                  onSelect={() =>
                    selectItem({
                      value: fallbackValue,
                      label: noAutoCompleteItemsLabel ?? "No Items found",
                    } as Parameters<typeof selectItem>[0])
                  }
                >
                  {noAutoCompleteItemsLabelRenderer?.(displayName) ?? (
                    <Label>{noAutoCompleteItemsLabel ?? "No items found"}</Label>
                  )}
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AutoCompleteInputField;
