import { DIContainer } from './di';
import { ServerSettings } from '../settings';
import { Logger } from '../modules/logger';

export interface AppServices {
  logger: Logger;

}

export const  initializeAppServices = (
  settings: ServerSettings
) => {
  const container = new DIContainer()
    .add('settings', () => settings)
    .add('logger', () => new Logger(settings.logger!))
    

   return container;
}

