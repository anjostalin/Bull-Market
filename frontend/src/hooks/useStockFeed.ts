import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface LivePrice {
  stockId: number;
  symbol: string;
  price: number;
  changePercent: number;
}

/**
 * Subscribes to /topic/prices over STOMP/SockJS and returns a map of stockId -> latest price.
 * The backend broadcasts the full list of updated prices every tick (~5s).
 */
export function useStockFeed(): Record<number, LivePrice> {
  const [prices, setPrices] = useState<Record<number, LivePrice>>({});
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 4000,
      onConnect: () => {
        client.subscribe('/topic/prices', (msg) => {
          try {
            const updates: LivePrice[] = JSON.parse(msg.body);
            setPrices((prev) => {
              const next = { ...prev };
              for (const u of updates) next[u.stockId] = u;
              return next;
            });
          } catch {
            /* ignore malformed frame */
          }
        });
      },
    });
    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, []);

  return prices;
}
