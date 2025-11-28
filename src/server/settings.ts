import { type LoggerSettings } from './modules/logger/settings';

export interface ServerSettings {
  logger?: LoggerSettings; // Make logger settings optional
  validateRequest?: boolean;
  validateResponse?: boolean;
}