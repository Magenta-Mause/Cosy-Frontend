import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useQuery } from "@tanstack/react-query";
import type * as React from "react";
import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { GameServerCreationDto } from "@/api/generated/model";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { GameServerCreationContext } from "./CreateGameServerModal";
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
  fallbackValue: TAutoCompleteData;
  onItemSelect?: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => ReactNode;
  noAutoCompleteItemsLabel?: string;
  searchId?: string;
  searchCallback: (
    searchValue: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
}

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
}: Props<TSelectedItem, TAutoCompleteData>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");
  const { setGameServerState, creationState } = useContext(GameServerCreationContext);
  const { setAttributeValid, setAttributeTouched } = useContext(GameServerCreationPageContext);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [queryGameName, setQueryGameName] = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isLoading,
    isError,
    data: autoCompleteItems,
  } = useQuery({
    queryKey: [searchId, "search", queryGameName],
    queryFn: () => searchCallback(queryGameName),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    setAttributeTouched(attribute, creationState.gameServerState[attribute] !== undefined);
  }, [setAttributeTouched, attribute, creationState.gameServerState]);

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
      if (onItemSelect) {
        onItemSelect(item);
      }
    },
    [
      attribute,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      validator,
      onItemSelect,
    ],
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      const inContent = target.closest('[data-slot="popover-content"]');
      const inTrigger = target.closest('[data-slot="popover-trigger"]');

      if (!inContent && !inTrigger) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <Popover open={open}>
      <PopoverTrigger className="w-[25vw]">
        <div className="w-full">
          <Input
            ref={inputRef}
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
                setQueryGameName(currentValue);
              }, DEBOUNCE_DELAY);
            }}
            autoComplete="off"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[25vw]">
        <div data-loading={isLoading} >
          <Command>
            <CommandList>
              {isLoading ? (
                <CommandItem key="loading" disabled>
                  <p>{t("loadingLabel")}</p>
                </CommandItem>
              ) : !isError && autoCompleteItems.length > 0 ? (
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
                  {noAutoCompleteItemsLabelRenderer?.(displayName) ?? (
                    <Label>{noAutoCompleteItemsLabel ?? "Unknown Item"}</Label>
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
export type { AutoCompleteItem };
