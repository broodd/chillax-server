import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const user = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as userController from '../controllers/user';

user.get('/userinfo/:id', authGuard, asyncWrapper(userController.getUserInfo));

user.post('/login', asyncWrapper(userController.postLogin));
user.post('/signup', asyncWrapper(userController.postSignup));

user.put('/user/like/:id', authGuard, asyncWrapper(userController.putAuthorLike));
user.get('/test-api', (req, res) => {
	console.log('--- test-api', );
	res.send({
		messsage: 'OKey any'
	})
});

export default user;