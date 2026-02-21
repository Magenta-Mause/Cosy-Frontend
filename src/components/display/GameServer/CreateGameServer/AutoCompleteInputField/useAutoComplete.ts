import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "../CreateGameServerModal";
import { GameServerCreationPageContext } from "../GenericGameServerCreationPage";
import type { AutoCompleteItem, AutoCompleteSelections, GameServerCreationValue } from "./types";

const DEBOUNCE_DELAY = 300;
const MAX_ITEMS_DISPLAYED = 20;

interface UseAutoCompleteOptions<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  attribute?: keyof GameServerCreationFormState;
  selectionKey?: string;
  validator?: (value: TAutoCompleteData) => boolean;
  searchId?: string;
  searchCallback: (
    searchValue: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
  disableDebounce?: boolean;
  disableCache?: boolean;
  onItemSelect?: (
    item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>,
    updatedSelections: AutoCompleteSelections,
  ) => void;
  alwaysIncludeFallback?: boolean;
  fallbackValue?: TAutoCompleteData;
  fallbackLabel?: string;
}

export function useAutoComplete<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  selectionKey,
  validator,
  searchId,
  searchCallback,
  disableDebounce,
  disableCache,
  onItemSelect,
  alwaysIncludeFallback,
  fallbackValue,
  fallbackLabel,
}: UseAutoCompleteOptions<TSelectedItem, TAutoCompleteData>) {
  const { setGameServerState, creationState, setUtilState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeValid, setAttributeTouched } = useContext(GameServerCreationPageContext);
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  const effectiveKey = attribute ?? selectionKey ?? "";

  const [open, setOpen] = useState(false);
  const initialDisplayName =
    creationState.utilState.autoCompleteSelections?.[effectiveKey]?.label ?? "";
  const [displayName, setDisplayName] = useState<string>(initialDisplayName);
  const [queryGameName, setQueryGameName] = useState<string>("");

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    isLoading: queryLoading,
    isError,
    data: autoCompleteItems,
  } = useQuery({
    queryKey: [searchId, "search", queryGameName],
    queryFn: () => searchCallback(queryGameName),
    staleTime: disableCache ? 0 : 1000 * 60 * 5,
    cacheTime: disableCache ? 0 : undefined,
    retry: false,
  });

  const isLoading = queryLoading || debounceRef.current !== null;

  useEffect(() => {
    if (attribute) {
      setAttributeTouched(attribute, creationState.gameServerState[attribute] !== undefined);
    }
  }, [setAttributeTouched, attribute, creationState.gameServerState]);

  // Sync display name with saved selection when returning to this step
  useEffect(() => {
    if (!open) {
      const savedLabel = creationState.utilState.autoCompleteSelections?.[effectiveKey]?.label;
      if (savedLabel && displayName !== savedLabel) {
        setDisplayName(savedLabel);
      }
    }
  }, [open, creationState.utilState.autoCompleteSelections, effectiveKey, displayName]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectItem = useCallback(
    (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => {
      setDisplayName(item.label);
      setOpen(false);

      if (attribute) {
        const valid = validator ? validator(item.value) : true;
        setGameServerState(attribute)(item.value);
        setAttributeValid(attribute, valid);
        setAttributeTouched(attribute, true);
      }

      const updatedSelections = {
        ...(creationState.utilState.autoCompleteSelections ?? {}),
        [effectiveKey]: item,
      } as AutoCompleteSelections;

      setUtilState("autoCompleteSelections")(updatedSelections);

      if (onItemSelect) {
        onItemSelect(item, updatedSelections);
      }
    },
    [
      attribute,
      effectiveKey,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      setUtilState,
      creationState.utilState.autoCompleteSelections,
      validator,
      onItemSelect,
    ],
  );

  const regularItemCount = autoCompleteItems
    ? Math.min(autoCompleteItems.length, MAX_ITEMS_DISPLAYED)
    : 0;
  const itemCount = regularItemCount + (alwaysIncludeFallback ? 1 : 0);

  // Reset selected index when popover opens or items change
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % itemCount || 0);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + itemCount) % itemCount || 0);
        return;
      }

      if (e.key === "Enter" && itemCount > 0) {
        e.preventDefault();
        e.stopPropagation();
        if (alwaysIncludeFallback && selectedIndex === 0) {
          selectItem({
            value: fallbackValue,
            label: fallbackLabel ?? t("noResultsLabel"),
          } as AutoCompleteItem<TSelectedItem, TAutoCompleteData>);
        } else {
          const adjustedIndex = alwaysIncludeFallback ? selectedIndex - 1 : selectedIndex;
          const items = autoCompleteItems?.slice(0, MAX_ITEMS_DISPLAYED) ?? [];
          if (adjustedIndex >= 0 && adjustedIndex < items.length) {
            selectItem(items[adjustedIndex]);
          }
        }
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
  }, [open, autoCompleteItems, itemCount, selectedIndex, selectItem, alwaysIncludeFallback, fallbackValue, fallbackLabel, t]);

  const handleInputChange = useCallback(
    (currentValue: string) => {
      setOpen(true);
      if (disableDebounce) {
        setQueryGameName(currentValue);
        setDisplayName(currentValue);
        return;
      }
      setDisplayName(currentValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setOpen(true);
        setQueryGameName(currentValue);
        debounceRef.current = null;
      }, DEBOUNCE_DELAY);
    },
    [disableDebounce],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !open) {
        triggerNextPage();
      }
    },
    [open, triggerNextPage],
  );

  const handleItemHover = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return {
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
  };
}
