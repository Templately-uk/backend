import app from './app';
import { environment } from './config/environment';
import logger from './config/logger';

// Load PORT
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on ${PORT}`);
});

if (environment.production == false) {
  logger.debug(`Environment Variables: ${JSON.stringify(environment)}`);
}

// Tutorial: https://dev.to/mkabumattar/setting-up-node-js-express-prettier-eslint-and-husky-application-with-babel-and-typescript-part-1-2ple

export default app;
