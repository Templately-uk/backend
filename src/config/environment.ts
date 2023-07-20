import * as dotenv from 'dotenv';

dotenv.config();

interface Environment {
  production: boolean;
  sentry: {
    dsn: string;
  };
  openai: {
    key: string;
  };
  api: {
    secret: string;
  };
  redis: {
    url: string;
  };
}

export const environment: Environment = {
  production: process.env.production ? process.env.PRODUCTION === 'true' : false,
  sentry: {
    dsn: process.env.SENTRY_DSN as string,
  },
  openai: {
    key: process.env.OPENAI_KEY as string,
  },
  api: {
    secret: process.env.API_SECRET as string,
  },
  redis: {
    url: process.env.REDIS_URL as string,
  },
};
