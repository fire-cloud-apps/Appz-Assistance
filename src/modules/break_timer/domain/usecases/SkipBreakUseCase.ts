import { useBreakTimerStore } from '../../presentation/hooks/useBreakTimerStore';

class SkipBreakUseCase {
  execute(): void {
    const { breakSettings, setTimeRemaining } = useBreakTimerStore.getState();
    if (breakSettings) {
      setTimeRemaining(breakSettings.breakInterval * 60);
    }
  }
}

export const skipBreakUseCase = new SkipBreakUseCase();
