import { useSyncExternalStore } from "react";

/** True after the client has mounted; false during SSR. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
