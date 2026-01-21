import {useQuery} from "@tanstack/react-query";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import type {GameServerCreationDto} from "@/api/generated/model";
import {GameServerCreationContext} from "../CreateGameServerModal";
import {GameServerCreationPageContext} from "../GenericGameServerCreationPage";
import type {AutoCompleteItem, GameServerCreationValue} from "./types";

const DEBOUNCE_DELAY = 300;

interface UseAutoCompleteOptions<TSelectedItem, TAutoCompleteData extends GameServerCreationValue> {
  attribute: keyof GameServerCreationDto;
  validator: (value: TAutoCompleteData) => boolean;
  searchId?: string;
  searchCallback: (searchValue: string) => Promise<AutoCompleteItem<TSelectedItem, TAutoCompleteData>[]>;
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
  const {setGameServerState, creationState, setUtilState, triggerNextPage} =
    useContext(GameServerCreationContext);
  const {setAttributeValid, setAttributeTouched} = useContext(GameServerCreationPageContext);

  const [open, setOpen] = useState(false);
  const initialDisplayName =
    creationState.utilState.autoCompleteSelections?.[attribute]?.label ?? "";
  const [displayName, setDisplayName] = useState<string>(initialDisplayName);
  const [queryGameName, setQueryGameName] = useState<string>("");

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const lastHoveredIndexRef = useRef<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandRef = useRef<HTMLDivElement>(null);
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
        [attribute]: {
          label: item.label,
          value: item.value,
          additionalInformation: item.additionalInformation,
          data: item.data,
        },
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

  // Reset hovered index when popover closes
  useEffect(() => {
    if (!open) {
      setHoveredIndex(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
      }

      if (e.key === "Enter" && autoCompleteItems && autoCompleteItems.length > 0) {
        e.preventDefault();
        const items = autoCompleteItems.slice(0, 5);

        let indexToSelect: number;
        if (hoveredIndex !== null && hoveredIndex < items.length) {
          indexToSelect = hoveredIndex;
        } else if (
          lastHoveredIndexRef.current !== null &&
          lastHoveredIndexRef.current < items.length
        ) {
          indexToSelect = lastHoveredIndexRef.current;
        } else {
          indexToSelect = 0;
        }

        selectItem(items[indexToSelect]);
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
  }, [open, autoCompleteItems, hoveredIndex, selectItem]);

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
    setHoveredIndex(index);
    lastHoveredIndexRef.current = index;
  }, []);

  const handleItemLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return {
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
  };
}
