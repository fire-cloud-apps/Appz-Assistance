import { useEffect, useRef, useCallback } from 'react';
import { useBreakTimerStore } from './useBreakTimerStore';
import { getBreakSettingsUseCase } from '../../domain/usecases/GetBreakSettingsUseCase';
import { showNotification, hasNotificationPermission } from '../../../../core/services/notificationService';
import { notifications } from '@mantine/notifications';

// Local list of inspirational quotes (avoids CORS issues with external APIs)
const INSPIRATIONAL_QUOTES = [
  { quote: "Take a deep breath and relax.", author: "AppZ" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { quote: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { quote: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
  { quote: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { quote: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
  { quote: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { quote: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
  { quote: "Do what you can with all you have, wherever you are.", author: "Theodore Roosevelt" },
  { quote: "You have been assigned this mountain to show others it can be moved.", author: "Mel Robbins" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
];

// Helper function to get a random quote
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
  return INSPIRATIONAL_QUOTES[randomIndex];
};

export const useBreakTimer = () => {
  const {
    isTimerRunning,
    timeRemaining,
    breakSettings,
    setBreakSettings,
    setTimeRemaining,
  } = useBreakTimerStore();

  const workerRef = useRef<Worker | null>(null);
  const notificationSentRef = useRef<boolean>(false);

  // Function to load settings on startup
  const loadSettings = useCallback(async () => {
    const settings = await getBreakSettingsUseCase.execute();
    setBreakSettings(settings);
  }, [setBreakSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Initialize Web Worker for accurate timing
  useEffect(() => {
    workerRef.current = new Worker(new URL('../../workers/breakTimerWorker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event: MessageEvent<{
      type: 'tick';
      payload: {
        remaining: number;
        isComplete: boolean;
      };
    }>) => {
      const { remaining, isComplete } = event.data.payload;
      
      setTimeRemaining(remaining);
      
      // Send notification when timer completes
      if (isComplete && !notificationSentRef.current) {
        notificationSentRef.current = true;
        sendBreakNotification();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setTimeRemaining]);

  // Send break notification
  const sendBreakNotification = useCallback(async () => {
    const { quote, author } = getRandomQuote();
    const notificationBody = `"${quote}" - ${author}`;

    // Send browser desktop notification immediately
    if (hasNotificationPermission()) {
      showNotification('Time for a break!', {
        body: notificationBody,
        requireInteraction: false,
        tag: 'break-timer',
      });
    }

    // Also show Mantine in-app notification
    notifications.show({
      title: 'Time for a break!',
      message: notificationBody,
      color: 'blue',
      autoClose: 10000,
      withCloseButton: true,
    });
  }, []);

  // Reset notification flag when timer is stopped or settings change
  useEffect(() => {
    if (!isTimerRunning) {
      notificationSentRef.current = false;
    }
  }, [isTimerRunning]);

  // Start the timer
  const startTimer = useCallback(async () => {
    await loadSettings();
    const currentSettings = useBreakTimerStore.getState().breakSettings;

    if (!currentSettings) {
      return;
    }

    const { setIsTimerRunning } = useBreakTimerStore.getState();
    
    // Only start if within working hours
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [startHour, startMinute] = currentSettings.workingHoursStart.split(':').map(Number);
    const [endHour, endMinute] = currentSettings.workingHoursEnd.split(':').map(Number);

    const isWithinWorkingHours =
      (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
      (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute));

    if (!isWithinWorkingHours) {
      notifications.show({
        title: 'Outside Working Hours',
        message: `Break timer only runs during working hours (${currentSettings.workingHoursStart} - ${currentSettings.workingHoursEnd})`,
        color: 'orange',
        autoClose: 5000,
      });
      return;
    }

    setIsTimerRunning(true);
    notificationSentRef.current = false;
    
    // Start the web worker timer
    workerRef.current?.postMessage({
      type: 'start',
      payload: {
        breakIntervalSeconds: currentSettings.breakInterval * 60,
      },
    });
  }, [loadSettings]);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    useBreakTimerStore.getState().setIsTimerRunning(false);
    workerRef.current?.postMessage({ type: 'pause' });
  }, []);

  // Stop the timer
  const stopTimer = useCallback(() => {
    useBreakTimerStore.getState().stopTimer();
    notificationSentRef.current = false;
    workerRef.current?.postMessage({ type: 'stop' });
  }, []);

  return {
    isTimerRunning,
    timeRemaining,
    breakSettings,
    startTimer,
    pauseTimer,
    stopTimer,
    updateBreakSettings: useBreakTimerStore.getState().updateBreakSettings,
  };
};
