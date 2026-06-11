export const ENDPOINTS = {
  AUTH: {
    PROFILE: '/auth/profile',
  },
  AUDIO: {
    PROCESS: '/audio/process',
    PROCESS_TEXT: '/audio/process-text',
    CONFIRM: '/audio/confirm',
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
  },
} as const;
