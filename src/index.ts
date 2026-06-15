import { appConfig } from './config/appConfig';
import { Logger } from './logger/logger';
import { createApp } from './http/createApp';

const logger = new Logger(appConfig.appName, {
  level: appConfig.logLevel,
});

const app = createApp();

app.listen(appConfig.port, () => {
  logger.info(`app started on port ${appConfig.port}`);
});
