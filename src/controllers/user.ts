import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from '../models/User';
import { check, sanitize, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import { JWT_SECRET } from '../util/secrets';
import { ApplicationError } from '../util/error-handler';
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

	if (!errors.isEmpty()) {
		req.flash('errors', errors.array());
		return res.redirect('/login');
	}

	const { email, password } = req.body;
	const user = await User.findOne({ email });
	const passwordCheck = bcrypt.compareSync(password, user.password);

	if (passwordCheck) {
		const token = jwt.sign({
			email: user.email,
			userId: user._id
		}, JWT_SECRET, {
			expiresIn: '1h'
		});

		return res.json({
			token: `Bearer ${token}`,
			data: user
		});
	} else {
		throw new ApplicationError('Account not found.', 401);
	}
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
  // sanitize('email').normalizeEmail({ gmail_remove_dots: false });

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	console.log('---', errors);

	const existingUser = await User.findOne({ email: req.body.email });

	if (existingUser) {
		throw new ApplicationError('Account with that email address already exists.', 401);
	}

	const user: UserDocument = await User.create({
		email: req.body.email,
		profile: {
			name: 'som'
		}
	});

	const token = jwt.sign({
		userId: user._id,
		email: user.email
	}, JWT_SECRET, {
		expiresIn: '1h'
	});

	return res.json({
		token: `Bearer ${token}`,
		data: user
	});
};
