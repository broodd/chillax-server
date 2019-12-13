import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const user = Router();

import authGuard from '../middlewares/authGuard';
import checkAdmin from '../middlewares/checkAdmin';

/**
 * Controllers (route handlers)
 */
import * as userController from '../controllers/user';

user.get('/userinfo/:id', authGuard, asyncWrapper(userController.getUserInfo));
user.get('/users', [authGuard, checkAdmin], asyncWrapper(userController.getUsers));

user.post('/login', asyncWrapper(userController.postLogin));
user.post('/signup', asyncWrapper(userController.postSignup));

user.put('/user/like/:id', authGuard, asyncWrapper(userController.putAuthorLike));

export default user;