import AppError from './error';

class CannotFindResourceError extends AppError {
  constructor(resource: string, identifier: string) {
    super({}, 500, `Cannot find resource ${resource} by identifier '${identifier}'`);
    this.name = 'CannotFindResource';
  }
}

export default CannotFindResourceError;
