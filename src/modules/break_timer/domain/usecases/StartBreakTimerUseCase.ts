import { breakTimerRepository } from '../../data/repositories/BreakTimerRepository';
import { useBreakTimerStore } from '../../presentation/hooks/useBreakTimerStore';

class StartBreakTimerUseCase {
  async execute(): Promise<void> {
    const settings = await breakTimerRepository.getBreakSettings();

    const { setBreakSettings, startTimer, setTimeRemaining } = useBreakTimerStore.getState();
    setBreakSettings(settings);
    
    startTimer();
    setTimeRemaining(settings.breakInterval * 60);
  }
}

export const startBreakTimerUseCase = new StartBreakTimerUseCase();
