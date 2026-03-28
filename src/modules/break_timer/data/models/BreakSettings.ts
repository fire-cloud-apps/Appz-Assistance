export interface BreakSettings {
  id: string; // Unique ID, e.g., 'default'
  breakInterval: number; // Interval in minutes between break notifications
  workingHoursStart: string; // e.g., "09:00"
  workingHoursEnd: string; // e.g., "17:00"
  createdAt: string;
  updatedAt: string;
}
