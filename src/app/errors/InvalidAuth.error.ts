import AppError from './error';

class InvalidAuthError extends AppError {
  constructor(message = '') {
    super({ auth: 'Could not authorise request' }, 500, message);
    this.name = 'InvalidAuthError';
  }
}

export default InvalidAuthError;
