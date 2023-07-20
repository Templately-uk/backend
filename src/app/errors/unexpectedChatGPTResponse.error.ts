import AppError from './error';

class UnexpectedChatGPTError extends AppError {
  constructor(message = '') {
    super({ chatgpt: message }, 500, message);
    this.name = 'UnexpectedChatGPTError';
  }
}

export default UnexpectedChatGPTError;
