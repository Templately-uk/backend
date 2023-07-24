import { Job } from 'bull';
import { prisma } from '../../config/prisma';
import { openai } from '../../config/openai';
import InvalidRouteError from '../errors/InvalidRoute.error';
import CannotFindTemplateError from '../errors/cannotFindTemplate.error';
import UnexpectedChatGPTError from '../errors/unexpectedChatGPTResponse.error';

/**
 * This job is used to perform sentiment emotion analysis on a recently uploaded email template.
 * It is done by ChatGPT
 */
const onJob = async (job: Job) => {
  const templateId = job.data.templateId;
  if (!templateId) throw new InvalidRouteError(['templateId']);

  job.progress(10);

  // Find recently uploaded template
  const template = await prisma.template.findUnique({
    where: {
      id: templateId,
    },
  });
  if (!template) throw new CannotFindTemplateError(templateId);

  job.progress(20);

  // Send a request to ChatGPT API to perform sentiment analysis prompt
  const response = await getChatGptCompletion(template.template);
  const pattern = /"(.*?)"/; // Regular expression to capture anything between quotes
  const match = pattern.exec(response);

  if (match == undefined || match.length < 1) throw new Error(response);

  const aiTones = match[1];
  if (!aiTones) throw new UnexpectedChatGPTError(response);

  job.progress(80);

  // Update template with results
  await prisma.template.update({
    where: {
      id: template.id,
    },
    data: {
      aiTones: aiTones.trim().replace(/ /g, ''),
    },
  });

  job.progress(100);
};

/**
 * ChatGPT prompt to perform sentiment analysis on template.
 */
const preparePrompt = (template: string) => {
  return `
I want you to act as an Email Template Analysis Tones AI. 
Please provide me with an emotional analysis of a provided email template.

Emotional analysis tones to use: professional, friendly, assertive, polite, humorous, critical, inviting, formal, casual, grateful, apologetic, cautious, sarcastic, sympathetic, motivational, informative, urgent reassuring, instructional, appreciative

Email template:
${template}

Please produce 4 emotional tones from the template and figures that add up to 100% as expected:
"tonename:(0-100),tonename:(0-100):tonename:(0-100):tonename:(0-100)"
    `;
};

const getChatGptCompletion = async (template: string) => {
  const chatCompletionResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: preparePrompt(template),
      },
    ],
  });

  const aiResponse = chatCompletionResponse.data.choices[0]?.message?.content;
  if (!aiResponse) throw new UnexpectedChatGPTError(aiResponse);

  return aiResponse;
};

export default onJob;
