import { GameServerCreationContext } from "@components/CreateGameServer/CreateGameServerModal.tsx";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import type * as React from "react";
import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { GameServerCreationDto } from "@/api/generated/model";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { GameServerCreationPageContext } from "./GenericGameServerCreationPage";

const DEBOUNCE_DELAY = 500;

type GameServerCreationValue = Exclude<
  GameServerCreationDto[keyof GameServerCreationDto],
  undefined
>;

type AutoCompleteItem<T, U extends GameServerCreationValue> = {
  data: T;
  value: U;
  label: string;
  leftSlot?: React.ReactNode;
};

interface Props<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  attribute: keyof GameServerCreationDto;
  validator: (value: TAutoCompleteData) => boolean;
  placeholder: string;
  getAutoCompleteItems: (
    val: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
  fallbackValue: string;
  selectItemCallback?: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => ReactNode;
  noAutoCompleteItemsLabel?: ReactNode;
}

function AutoCompleteInputField<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  validator,
  placeholder,
  getAutoCompleteItems,
  selectItemCallback,
  noAutoCompleteItemsLabelRenderer,
  noAutoCompleteItemsLabel,
  fallbackValue,
}: Props<TSelectedItem, TAutoCompleteData>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");
  const { setGameServerState, creationState } = useContext(GameServerCreationContext);
  const { setAttributeValid, setAttributeTouched } = useContext(GameServerCreationPageContext);
  const [autoCompleteItems, setAutoCompleteItems] = useState<
    AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial setup only
  useEffect(() => {
    setAttributeTouched(attribute, creationState.gameServerState[attribute] !== undefined);

    // `creationState.gameServerState[attribute]` has to be of type TAutoCompleteData, because ...
    setAttributeValid(
      attribute,
      validator(creationState.gameServerState[attribute] as unknown as TAutoCompleteData),
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
    (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => {
      const valid = validator(item.value);

      setDisplayName(item.label);
      setOpen(false);
      setGameServerState(attribute)(item.value);
      setAttributeValid(attribute, valid);
      setAttributeTouched(attribute, true);
      if (selectItemCallback) {
        selectItemCallback(item);
      }
    },
    [
      attribute,
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
                  key={item.value.toString()}
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
                  } as AutoCompleteItem<TSelectedItem, TAutoCompleteData>)
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
