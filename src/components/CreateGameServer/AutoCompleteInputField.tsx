import { GameServerCreationContext } from "@components/CreateGameServer/CreateGameServerModal.tsx";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import type * as React from "react";
import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { type InputType, preProcessInputValue } from "@/lib/utils";
import { GameServerCreationPageContext } from "./GenericGameServerCreationPage";

const DEBOUNCE_DELAY = 500;

type AutoCompleteItem<T> = {
  data: T;
  value: string;
  label: string;
  leftSlot?: React.ReactNode;
};

interface Props<T> {
  attribute: keyof GameServerCreationDto;
  validator: ZodType;
  placeholder: string;
  getAutoCompleteItems: (val: string) => Promise<AutoCompleteItem<T>[]>;
  inputType: InputType;
  fallbackValue: string;
  selectItemCallback?: (item: AutoCompleteItem<T>) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => ReactNode;
  noAutoCompleteItemsLabel?: ReactNode;
}

function AutoCompleteInputField<T>({
  attribute,
  validator,
  placeholder,
  getAutoCompleteItems,
  inputType,
  selectItemCallback,
  noAutoCompleteItemsLabelRenderer,
  noAutoCompleteItemsLabel,
  fallbackValue,
}: Props<T>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");
  const { setGameServerState, creationState } = useContext(GameServerCreationContext);
  const { setAttributeValid, setAttributeTouched } = useContext(GameServerCreationPageContext);
  const [autoCompleteItems, setAutoCompleteItems] = useState<AutoCompleteItem<T>[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial setup only
  useEffect(() => {
    setAttributeTouched(attribute, creationState.gameServerState[attribute] !== undefined);
    setAttributeValid(
      attribute,
      validator.safeParse(creationState.gameServerState[attribute]).success,
    );
  }, []);

  const queryAutoCompleteItems = useCallback(
    async (value: string) => {
      setLoading(true);
      try {
        const items = await getAutoCompleteItems(value);
        setAutoCompleteItems(items);
      } catch {
        setAutoCompleteItems([]);
      } finally {
        setLoading(false);
      }
    },
    [getAutoCompleteItems],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectItem = useCallback(
    (item: AutoCompleteItem<T>) => {
      const value = preProcessInputValue(item.value, inputType);
      const valid = validator.safeParse(value).success;

      setDisplayName(item.label);
      setOpen(false);
      setGameServerState(attribute)(value);
      setAttributeValid(attribute, valid);
      setAttributeTouched(attribute, true);
      if (selectItemCallback) {
        selectItemCallback(item);
      }
    },
    [
      attribute,
      inputType,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      validator,
      selectItemCallback,
    ],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Input
          placeholder={placeholder}
          id={attribute}
          value={displayName}
          onChange={(e) => {
            const currentValue = e.target.value;
            setDisplayName(currentValue);

            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
              setOpen(() => true);
              void queryAutoCompleteItems(currentValue);
            }, DEBOUNCE_DELAY);
          }}
          autoComplete="off"
        />
      </PopoverTrigger>

      <PopoverContent className="w-fit">
        <Command>
          <CommandList>
            {loading && (
              <CommandItem key="loading" disabled>
                <p>{t("loadingLabel")}</p>
              </CommandItem>
            )}
            {autoCompleteItems.length > 0 ? (
              autoCompleteItems.slice(0, 5).map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => selectItem(item)}
                  className="flex-auto items-center"
                >
                  <div className="shrink-0">{item.leftSlot}</div>
                  <Label className="text-xl">{item.label}</Label>
                </CommandItem>
              ))
            ) : (
              <CommandItem
                key="unknown-item"
                onSelect={() =>
                  selectItem({
                    value: fallbackValue,
                    label: noAutoCompleteItemsLabel ?? "Unknown Item",
                  } as AutoCompleteItem<T>)
                }
              >
                {noAutoCompleteItemsLabelRenderer?.(displayName) ?? noAutoCompleteItemsLabel ?? (
                  <Label>{"Unknown Item"}</Label>
                )}
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default AutoCompleteInputField;
