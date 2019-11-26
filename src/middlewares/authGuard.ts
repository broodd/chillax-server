import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../util/secrets';
import { ApplicationError } from '../util/error-handler';
import { User, IUser } from '../models/User';
import logger from '../util/logger';

export default (req: Request, res: Response, next: NextFunction) => {
  let token: string = req.headers['authorization'];

  if (token) {
    if (token.includes('Bearer ')) {
			token = token.split(' ')[1];
		}

    jwt.verify(token, JWT_SECRET, async (err,  decoded: any) => {
			if (err) {
				const err = new ApplicationError('Token is not valid', 401);
				return next(err);
      } else {
        res.locals.token = decoded;

        const user: IUser = await User.findById(decoded.userId);
        if (!user) {
          throw new ApplicationError('User not found', 401);
        }
        res.locals.user = user;
        return next();
      }
    });

  } else {
    throw new ApplicationError('Auth token is not supplied', 401);
  }
};