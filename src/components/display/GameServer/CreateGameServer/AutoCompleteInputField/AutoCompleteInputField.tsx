import { FieldLabel } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import AutoCompleteItemList from "./AutoCompleteItemList";
import type { AutoCompleteInputFieldProps, GameServerCreationValue } from "./types";
import { useAutoComplete } from "./useAutoComplete";

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
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  const {
    open,
    setOpen,
    displayName,
    isLoading,
    isError,
    autoCompleteItems,
    selectedIndex,
    inputRef,
    selectItem,
    handleInputChange,
    handleInputKeyDown,
    handleItemHover,
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
        <div className="w-full" tabIndex={-1}>
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
        <AutoCompleteItemList
          items={autoCompleteItems}
          isLoading={isLoading}
          isError={isError}
          selectedIndex={selectedIndex}
          loadingLabel={t("loadingLabel")}
          fallbackValue={fallbackValue}
          noItemsLabel={noAutoCompleteItemsLabel}
          noItemsLabelRenderer={noAutoCompleteItemsLabelRenderer}
          displayValue={displayName}
          onSelectItem={selectItem}
          onHoverItem={handleItemHover}
        />
      </PopoverContent>
    </Popover>
  );
}

export default AutoCompleteInputField;
