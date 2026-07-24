export enum CalendarEventType {
  MaintenanceWindow = 'MaintenanceWindow',
  BlackoutPeriod = 'BlackoutPeriod',
  ReleaseFreeze = 'ReleaseFreeze'
}

export interface CalendarEvent {
  eventId: string;
  type: CalendarEventType;
  
  title: string;
  description: string;
  
  start: Date;
  end: Date;
  
  affectedRegions?: string[];
  affectedServices?: string[];
}

export interface ChangeCalendar {
  getEventsInTimerange(start: Date, end: Date): Promise<CalendarEvent[]>;
  detectCollisions(start: Date, end: Date, regions?: string[], services?: string[]): Promise<CalendarEvent[]>;
}
