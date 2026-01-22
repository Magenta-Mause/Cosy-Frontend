import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { GameServerCreationDto } from "@/api/generated/model";
import { GameServerCreationContext } from "../CreateGameServerModal";
import { GameServerCreationPageContext } from "../GenericGameServerCreationPage";
import type { AutoCompleteItem, GameServerCreationValue } from "./types";

const DEBOUNCE_DELAY = 300;

interface UseAutoCompleteOptions<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  attribute: keyof GameServerCreationDto;
  validator: (value: TAutoCompleteData) => boolean;
  searchId?: string;
  searchCallback: (
    searchValue: string,
  ) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
  disableDebounce?: boolean;
  onItemSelect?: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
}

export function useAutoComplete<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  validator,
  searchId,
  searchCallback,
  disableDebounce,
  onItemSelect,
}: UseAutoCompleteOptions<TSelectedItem, TAutoCompleteData>) {
  const { setGameServerState, creationState, setUtilState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeValid, setAttributeTouched } = useContext(GameServerCreationPageContext);

  const [open, setOpen] = useState(false);
  const initialDisplayName =
    creationState.utilState.autoCompleteSelections?.[attribute]?.label ?? "";
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
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const isLoading = queryLoading || debounceRef.current !== null;

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

      setUtilState("autoCompleteSelections")({
        ...(creationState.utilState.autoCompleteSelections ?? {}),
        [attribute]: item,
      });

      // Keep focus on the input after selection
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

      if (onItemSelect) {
        onItemSelect(item);
      }
    },
    [
      attribute,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      setUtilState,
      creationState.utilState.autoCompleteSelections,
      validator,
      onItemSelect,
    ],
  );

  const maxItems = 5;
  const itemCount = autoCompleteItems ? Math.min(autoCompleteItems.length, maxItems) : 0;

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

      if (e.key === "Enter" && autoCompleteItems && autoCompleteItems.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        const items = autoCompleteItems.slice(0, maxItems);
        if (selectedIndex < items.length) {
          selectItem(items[selectedIndex]);
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
  }, [open, autoCompleteItems, itemCount, selectedIndex, selectItem]);

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
