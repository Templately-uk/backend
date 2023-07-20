import AppError from './error';

class CannotFindTemplateError extends AppError {
  constructor(templateIdentifier: string) {
    super({}, 500, `Cannot find template by identifier '${templateIdentifier}'`);
    this.name = 'CannotFindTemplateError';
  }
}

export default CannotFindTemplateError;
