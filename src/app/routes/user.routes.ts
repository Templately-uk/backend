import { Router } from 'express';
import UserController from '../controllers/user.controller';

export default Router().use(UserController);
