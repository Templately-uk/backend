import AppError from './error';

class NoAuthorisationError extends AppError {
  constructor(message = '') {
    super({ auth: 'Could not authorise request' }, 500, message);
    this.name = 'NoAuthorisationError';
  }
}

export default NoAuthorisationError;
