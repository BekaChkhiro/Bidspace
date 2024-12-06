import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (auctionId) => {
    const ws = useRef(null);
    
    const connect = useCallback(() => {
        ws.current = new WebSocket('ws://localhost:8080/auction');

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            // Join specific auction room
            ws.current.send(JSON.stringify({
                type: 'join_auction',
                auction_id: auctionId
            }));
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            // Try to reconnect after 3 seconds
            setTimeout(connect, 3000);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [auctionId]);

    useEffect(() => {
        const cleanup = connect();
        return cleanup;
    }, [connect]);

    const sendBid = useCallback((bidData) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'new_bid',
                auction_id: auctionId,
                bid: bidData
            }));
        }
    }, [auctionId]);

    return { sendBid };
};
