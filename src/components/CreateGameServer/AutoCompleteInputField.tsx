import { GameServerCreationContext } from "@components/CreateGameServer/CreateGameServerModal.tsx";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type * as React from "react";
import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  buildAutoCompleteItemsQueryParameters: (
    val: string,
  ) => UseQueryOptions<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[], unknown>;
  fallbackValue: TAutoCompleteData;
  selectItemCallback?: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  noAutoCompleteItemsLabelRenderer?: (displayValue: string) => ReactNode;
  noAutoCompleteItemsLabel?: string;
}

function AutoCompleteInputField<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  validator,
  placeholder,
  buildAutoCompleteItemsQueryParameters,
  selectItemCallback,
  noAutoCompleteItemsLabelRenderer,
  noAutoCompleteItemsLabel,
  fallbackValue,
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
  } = useQuery(buildAutoCompleteItemsQueryParameters(queryGameName));

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

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (!triggerRef.current) return;

    setTriggerWidth(triggerRef.current?.getBoundingClientRect().width);
  }, []);

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
      <PopoverTrigger className="w-3/4" ref={triggerRef}>
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

      <PopoverContent
        className="w-full"
        style={{ width: triggerWidth ? `${triggerWidth}px` : undefined }}
      >
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
      </PopoverContent>
    </Popover>
  );
}

export default AutoCompleteInputField;
export type { AutoCompleteItem };
