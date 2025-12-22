/**
 * Development-only logger
 * Only logs in development mode, silent in production
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};

/**
 * Production-safe logger that always logs (for critical errors)
 */
export const prodLogger = {
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
};
