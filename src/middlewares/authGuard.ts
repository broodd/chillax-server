import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../util/secrets';
import { ApplicationError } from '../util/error-handler';
import { User, UserDocument } from '../models/User';

export default (req: Request, res: Response, next: NextFunction) => {
  let token = <string>req.headers['x-access-token'] || <string>req.headers['authorization'];

  if (token) {
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET, (err,  decoded: any) => {
      if (err) {
        throw new ApplicationError('Token is not valid', 401);
      } else {
        res.locals.token = decoded;

        const { userId, username } = decoded;
        // const user = await User.findById(decoded.userId);
        // res.locals.user = user;
        // return next();
        User.findById(decoded.userId)
          .then((user: UserDocument) => {
            res.locals.user = user;
            return next();
          });
      }
    });

  } else {
    throw new ApplicationError('Auth token is not supplied', 401);
  }
};