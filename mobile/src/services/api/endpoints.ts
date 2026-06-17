export const ENDPOINTS = {
  AUTH: {
    PROFILE: '/auth/profile',
    PUSH_TOKEN: '/auth/push-token',
    DELETE_ACCOUNT: '/auth/account',
  },
  AUDIO: {
    PROCESS: '/audio/process',
    PROCESS_TEXT: '/audio/process-text',
    CONFIRM: '/audio/confirm',
  },
  IMAGE: {
    PROCESS: '/image/process',
  },
  STREAK: '/streak',
  LOGS: {
    DAILY: (date: string) => `/logs/${date}`,
    UPDATE_SUMMARY: (date: string) => `/logs/summary/${date}`,
    UPDATE_FIELD: (date: string) => `/logs/field/${date}`,
    WEEKLY: '/logs/weekly',
    WEEKLY_SUMMARY: '/logs/weekly-summary',
    MONTHLY_SUMMARY: '/logs/monthly-summary',
    YEARLY_SUMMARY: '/logs/yearly-summary',
    CALENDAR: (month: string) => `/logs/calendar/${month}`,
    DELETE_ENTRY: (date: string, entryId: string) => `/logs/${date}/entries/${entryId}`,
  },
} as const;
