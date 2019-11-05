import { Request, Response, NextFunction } from 'express';
import { User, UserDocument, AuthToken } from '../models/User';
import crypto from 'crypto';
import { check, sanitize, validationResult } from 'express-validator';


/**
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
  req.flash('errors', [123, 'some']);

  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};


/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  check('email', 'Email is not valid').isEmail();
  check('password', 'Password cannot be blank').isLength({ min: 1 });
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/login');
  }

  passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};
