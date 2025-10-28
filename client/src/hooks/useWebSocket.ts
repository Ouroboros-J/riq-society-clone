import { useEffect, useRef, useState } from 'react';

interface VerificationProgressMessage {
  type: 'verification_progress';
  applicationId: number;
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export function useWebSocket(applicationId: number | undefined) {
  const [progress, setProgress] = useState<{
    [platform: string]: 'pending' | 'running' | 'completed' | 'error';
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    // WebSocket 연결
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      
      // applicationId 구독
      ws.send(JSON.stringify({
        type: 'subscribe',
        applicationId: applicationId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: VerificationProgressMessage = JSON.parse(event.data);
        
        if (data.type === 'verification_progress' && data.applicationId === applicationId) {
          console.log('[WebSocket] Progress update:', data.platform, data.status);
          setProgress((prev) => ({
            ...prev,
            [data.platform]: data.status,
          }));
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    };

    // 정리
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [applicationId]);

  return { progress, isConnected };
}

