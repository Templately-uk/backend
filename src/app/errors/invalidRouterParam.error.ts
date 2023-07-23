import AppError from './error';

class InvalidRouterParamError extends AppError {
  constructor(param: string) {
    super({}, 500, `Router does not contain ${param} parameter`);
    this.name = 'InvalidRouterParamError';
  }
}

export default InvalidRouterParamError;
