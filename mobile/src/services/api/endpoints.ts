export const ENDPOINTS = {
  AUTH: {
    PROFILE: '/auth/profile',
  },
  AUDIO: {
    PROCESS: '/audio/process',
    PROCESS_TEXT: '/audio/process-text',
    CONFIRM: '/audio/confirm',
  },
  LOGS: {
    DAILY: (date: string) => `/logs/${date}`,
    WEEKLY: '/logs/weekly',
    WEEKLY_SUMMARY: '/logs/weekly-summary',
    MONTHLY_SUMMARY: '/logs/monthly-summary',
    YEARLY_SUMMARY: '/logs/yearly-summary',
  },
} as const;
