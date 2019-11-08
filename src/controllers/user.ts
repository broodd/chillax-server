import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { isEmail, isEmpty, isLength } from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import { JWT_SECRET } from '../util/secrets';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body;
	let errors = [];

	if (!email || !isEmail(email)) {
		errors.push('Email is not valid')
	}
	if (!password || isEmpty(password) || !isLength(password, { min: 5 })) {
		errors.push('Password to short' )
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 401);
	}

	const user = await User.findOne({ email });

	if (!user) {
		throw new ApplicationError('User not found', 401)
	}

	const passwordCheck = bcrypt.compareSync(password, user.password);

	if (passwordCheck) {
		const token = jwt.sign({
			userId: user._id,
			email: user.email
		}, JWT_SECRET, {
			expiresIn: 60 * 60
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
	const { name, email, password } = req.body;
	let errors = [];

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid')
	}
	if (!email || !isEmail(email)) {
		errors.push('Email is not valid')
	}
	if (!password || isEmpty(password) || !isLength(password, { min: 5 })) {
		errors.push('Password to short')
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 401);
	}

	const existingUser = await User.findOne({ email: req.body.email });

	if (existingUser) {
		throw new ApplicationError('Account with that email address already exists.', 401);
	}

	const user: IUser = await User.create({
		email,
		password,
		profile: {
			name: 'som'
		}
	});

	const token = jwt.sign({
		userId: user._id,
		email: user.email
	}, JWT_SECRET, {
		expiresIn: 60 * 60
	});

	return res.json({
		token: `Bearer ${token}`,
		data: user
	});
};
