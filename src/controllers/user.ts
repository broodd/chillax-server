import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from '../models/User';
import crypto from 'crypto';
import { check, sanitize, validationResult } from 'express-validator';
import logger from '../util/logger';

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

	logger.debug('errors', errors.array());
};

/**
 * POST /signup
 * Create a new account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  check('email', 'Email is not valid').isEmail();
	check('password', 'Password cannot be blank').isLength({ min: 1 });
	
	// if (!validator.isEmail(req.body.email))
  //   validationErrors.push({ msg: 'Please enter a valid email address.' });
  // if (!validator.isLength(req.body.password, { min: 8 }))
  //   validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  // if (req.body.password !== req.body.confirmPassword)
	//   validationErrors.push({ msg: 'Passwords do not match' });
	
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);
	logger.debug('errors', errors.array());


	const existingUser = await User.findOne({ email: req.body.email });

	if (existingUser) {
		throw 'Account with that email address already exists.';
	}

	const user: UserDocument = await User.create({
		email: req.body.email,
		profile: {
			name: 'som'
		}
	})

	return res.json({
		data: user
	})
};
