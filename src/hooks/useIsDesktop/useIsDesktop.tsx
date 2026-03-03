import { useSyncExternalStore } from "react";

export const DETAIL_VIEW_DESKTOP_BREAKPOINT = 1300;
export const DETAIL_VIEW_LG_MEDIA_QUERY = `(min-width: ${DETAIL_VIEW_DESKTOP_BREAKPOINT}px)`;
export const ULTRA_WIDE_MEDIA_QUERY = "(min-aspect-ratio: 2.147)";

function createMediaQueryHook(query: string) {
  const subscribe = (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export default createMediaQueryHook(DETAIL_VIEW_LG_MEDIA_QUERY);
export const useIsUltraWide = createMediaQueryHook(ULTRA_WIDE_MEDIA_QUERY);
