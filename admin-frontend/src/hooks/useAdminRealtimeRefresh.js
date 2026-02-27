import { useEffect, useRef } from "react";
import { subscribeToAdminEvents } from "../services/adminRealtimeService";

const DEFAULT_DEBOUNCE_MS = 500;

export const useAdminRealtimeRefresh = (
  onDatabaseChange,
  { debounceMs = DEFAULT_DEBOUNCE_MS } = {},
) => {
  const callbackRef = useRef(onDatabaseChange);
  const debounceRef = useRef(null);

  useEffect(() => {
    callbackRef.current = onDatabaseChange;
  }, [onDatabaseChange]);

  useEffect(() => {
    const unsubscribe = subscribeToAdminEvents({
      onEvent: (data) => {
        if (!data || data.type === "keepalive") return;

        if (!debounceMs || debounceMs <= 0) {
          callbackRef.current?.(data);
          return;
        }

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          callbackRef.current?.(data);
        }, debounceMs);
      },
    });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      unsubscribe();
    };
  }, [debounceMs]);
};
