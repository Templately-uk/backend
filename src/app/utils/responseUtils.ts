import { Response } from 'express';

interface ErrorResponse {
  error?: string;
  errors?: { [key: string]: string };
}

export function sendError(res: Response, error?: string, errors?: { [key: string]: string }, code = 400) {
  const response: ErrorResponse = {};
  if (error) {
    response.error = error;
  }
  if (errors) {
    response.errors = errors;
  }
  return res.status(code).json(response);
}

export function sendSuccess<T>(res: Response, data: T, code = 200) {
  return res.status(code).json(data);
}
