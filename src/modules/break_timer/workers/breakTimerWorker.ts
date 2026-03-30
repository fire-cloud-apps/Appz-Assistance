// Break Timer Web Worker for accurate timing even when tab is inactive
let timerInterval: number | null = null;
let targetTime: number | null = null;

interface TimerMessage {
  type: 'start' | 'pause' | 'stop';
  payload?: {
    breakIntervalSeconds?: number;
  };
}

const sendTick = () => {
  if (targetTime === null) return;
  
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((targetTime - now) / 1000));
  
  self.postMessage({
    type: 'tick',
    payload: {
      remaining,
      isComplete: remaining <= 0,
    },
  });
};

const startTimer = (intervalSeconds: number) => {
  targetTime = Date.now() + (intervalSeconds * 1000);
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Send updates every second
  timerInterval = self.setInterval(sendTick, 1000);
  sendTick(); // Send initial state
};

const handleMessage = (event: MessageEvent<TimerMessage>) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'start':
      if (payload?.breakIntervalSeconds) {
        startTimer(payload.breakIntervalSeconds);
      }
      break;
      
    case 'pause':
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
      
    case 'stop':
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      targetTime = null;
      break;
  }
};

self.onmessage = handleMessage;

export {};
