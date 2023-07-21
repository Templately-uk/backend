/**
 * Required modules
 */
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { handleError } from './app/middlewares/errorHandler.middleware';
import morganMiddleware from './app/middlewares/morgan.middleware';
import * as Sentry from '@sentry/node';
import { environment as config } from './config/environment';
import expressStatusMonitor from 'express-status-monitor';

// Routes
import StatusRoutes from './app/routes/status.routes';
import TemplatesRoutes from './app/routes/templates.routes';
import MetricsRoutes from './app/routes/metrics.routes';
import AdminRoutes from './app/routes/admin.routes';
import UserRoutes from './app/routes/user.routes';

// Load .env file
dotenv.config();
const app = express();

/* Production-only middleware */
if (config.production) {
  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());
}

/* Monitoring */
app.use(expressStatusMonitor({ path: '/admin/status' }));

/* Global middleware */
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);
app.use(compression());

/* Routes */
app.use(StatusRoutes);
app.use(TemplatesRoutes);
app.use(MetricsRoutes);
app.use(AdminRoutes);
app.use(UserRoutes);

//! define after everything else
app.use(handleError);

export default app;
