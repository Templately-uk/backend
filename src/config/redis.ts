import Bull, { Job } from 'bull';
import { environment as config } from './environment';
import logger from './logger';
import { Redis } from 'ioredis';
import onTemplateAnalysis from '../app/queue/onTemplateAnalysis.job';

// Global accessible client for
export const redis = new Redis(config.redis.url);

/**
 * Queue for analysing the sentiment emotion of templates
 */
export const templateAnalysisQueue = new Bull('template_analysis', config.redis.url);
templateAnalysisQueue.process(async (job: Job) => {
  // Run the analysis
  logger.info(`Starting template analysis... ${job.data.templateId}`);
  await onTemplateAnalysis(job);
});
templateAnalysisQueue.on('error', (error) => {
  logger.error(`Error occurred on Template Analysis Queue job: ${error.message}`);
});
templateAnalysisQueue.on('completed', (job) => {
  logger.info(`Template Analysis Job ${job.id} [${job.data.templateId}] completed successfully`);
});
