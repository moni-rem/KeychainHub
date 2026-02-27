import { API_BASE_URL } from "./api";

const EVENTS_ENDPOINT = `${API_BASE_URL}/admin/events`;
const RECONNECT_DELAY_MS = 3000;

const getAuthToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("jwt");

const parseEventBlock = (block) => {
  if (!block) return null;

  let eventName = "message";
  const dataLines = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim() || "message";
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;

  const rawData = dataLines.join("\n");
  try {
    return { eventName, data: JSON.parse(rawData) };
  } catch {
    return { eventName, data: { raw: rawData } };
  }
};

export const subscribeToAdminEvents = ({
  onEvent,
  onOpen,
  onError,
} = {}) => {
  let disposed = false;
  let controller = null;
  let reconnectTimer = null;

  const connect = async () => {
    while (!disposed) {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Missing admin auth token");
        }

        controller = new AbortController();
        const response = await fetch(EVENTS_ENDPOINT, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Realtime connection failed (${response.status})`);
        }

        if (onOpen) onOpen();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!disposed) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          buffer = buffer.replace(/\r\n/g, "\n");

          let separatorIndex = buffer.indexOf("\n\n");
          while (separatorIndex !== -1) {
            const chunk = buffer.slice(0, separatorIndex).trim();
            buffer = buffer.slice(separatorIndex + 2);

            const parsed = parseEventBlock(chunk);
            if (parsed && onEvent) {
              onEvent(parsed.data, parsed.eventName);
            }

            separatorIndex = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        if (disposed || error?.name === "AbortError") {
          break;
        }
        if (onError) onError(error);
      }

      if (disposed) break;
      await new Promise((resolve) => {
        reconnectTimer = setTimeout(resolve, RECONNECT_DELAY_MS);
      });
    }
  };

  connect();

  return () => {
    disposed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (controller) {
      controller.abort();
    }
  };
};
