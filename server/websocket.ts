import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface VerificationProgressMessage {
  type: 'verification_progress';
  applicationId: number;
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

// WebSocket 클라이언트 관리
const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('[WebSocket] New connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // 클라이언트가 특정 applicationId를 구독
        if (data.type === 'subscribe' && data.applicationId) {
          const appId = String(data.applicationId);
          if (!clients.has(appId)) {
            clients.set(appId, new Set());
          }
          clients.get(appId)!.add(ws);
          console.log(`[WebSocket] Client subscribed to application ${appId}`);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      // 연결 종료 시 모든 구독에서 제거
      clients.forEach((clientSet) => {
        clientSet.delete(ws);
      });
      console.log('[WebSocket] Connection closed');
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  });

  return wss;
}

/**
 * 특정 applicationId를 구독 중인 클라이언트에게 메시지 전송
 */
export function broadcastVerificationProgress(
  applicationId: number,
  platform: string,
  status: 'pending' | 'running' | 'completed' | 'error',
  message?: string
) {
  const appId = String(applicationId);
  const clientSet = clients.get(appId);

  if (!clientSet || clientSet.size === 0) {
    console.log(`[WebSocket] No clients subscribed to application ${appId}`);
    return;
  }

  const progressMessage: VerificationProgressMessage = {
    type: 'verification_progress',
    applicationId,
    platform,
    status,
    message,
  };

  const messageStr = JSON.stringify(progressMessage);

  clientSet.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
      console.log(`[WebSocket] Sent progress to client: ${platform} - ${status}`);
    }
  });
}

