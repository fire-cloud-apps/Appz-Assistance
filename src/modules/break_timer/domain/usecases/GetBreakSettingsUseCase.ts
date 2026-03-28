import { breakTimerRepository } from '../../data/repositories/BreakTimerRepository';
import { BreakSettings } from '../../data/models/BreakSettings';

class GetBreakSettingsUseCase {
  async execute(): Promise<BreakSettings> {
    return await breakTimerRepository.getBreakSettings();
  }
}

export const getBreakSettingsUseCase = new GetBreakSettingsUseCase();
