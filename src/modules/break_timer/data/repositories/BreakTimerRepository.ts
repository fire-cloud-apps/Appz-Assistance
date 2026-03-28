import { db } from '../../../../core/database/appDatabase';
import { BreakSettings } from '../models/BreakSettings';

class BreakTimerRepository {
  private readonly SETTINGS_ID = 'default'; // Using a fixed ID for the single settings object

  async getBreakSettings(): Promise<BreakSettings> {
    let settings = await db.breakSettings.get(this.SETTINGS_ID);
    if (!settings) {
      settings = this.createDefaultSettings();
      await this.addBreakSettings(settings);
    }
    return settings;
  }

  async addBreakSettings(settings: BreakSettings): Promise<string> {
    settings.createdAt = new Date().toISOString();
    settings.updatedAt = new Date().toISOString();
    return await db.breakSettings.add(settings);
  }

  async updateBreakSettings(settings: BreakSettings): Promise<void> {
    settings.updatedAt = new Date().toISOString();
    await db.breakSettings.put(settings);
  }

  private createDefaultSettings(): BreakSettings {
    return {
      id: this.SETTINGS_ID,
      breakInterval: 50, // 50 minutes - simple work interval
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const breakTimerRepository = new BreakTimerRepository();
