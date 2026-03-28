import { breakTimerRepository } from '../../data/repositories/BreakTimerRepository';
import { BreakSettings } from '../../data/models/BreakSettings';
import { useBreakTimerStore } from '../../presentation/hooks/useBreakTimerStore';

class UpdateBreakSettingsUseCase {
  async execute(settings: BreakSettings): Promise<void> {
    await breakTimerRepository.updateBreakSettings(settings);
    
    const { updateBreakSettings } = useBreakTimerStore.getState();
    updateBreakSettings(settings);
  }
}

export const updateBreakSettingsUseCase = new UpdateBreakSettingsUseCase();
