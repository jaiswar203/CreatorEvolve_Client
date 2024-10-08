import { useEffect, useRef } from 'react';

// Define the type for the SSE data
export interface SSEData {
  status: string;
}

// Define the type for the onMessage function
type OnMessage = (data: SSEData) => void;

// useSSE hook with types
const useSSE = (url: string | null, onMessage: OnMessage) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/${url}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data: SSEData = JSON.parse(event.data);
      onMessage(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url, onMessage]);

  return () => {
    eventSourceRef.current?.close();
  };
};

export default useSSE;
