import AppError from './error';

class InvalidRouteError extends AppError {
  constructor(params: string[]) {
    super({}, 500, `Params [${params.join(', ')}] are not set in request`);
    this.name = 'InvalidRouteError';
  }
}

export default InvalidRouteError;
