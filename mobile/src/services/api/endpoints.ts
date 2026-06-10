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
  },
} as const;
