import { LevelWithSilent } from "pino";

export interface LoggerSettings {
  level?: LevelWithSilent;
  debug?: boolean | object;
  redact?: string[] | { paths: string[]; censor?: string; remove?: boolean };
  name?: string;
  base?: object;
}
