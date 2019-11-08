import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const user = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as userController from '../controllers/user';

user.post('/login', asyncWrapper(userController.postLogin));
user.post('/signup', asyncWrapper(userController.postSignup));

export default user;