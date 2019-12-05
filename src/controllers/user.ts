import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { isEmail, isEmpty, isLength } from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import { JWT_SECRET } from '../util/secrets';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';

/**
 * GET /user/:id
 * Get user info.
 */
export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params;
	const user: IUser = await User.findById(id)
		.populate('followersCount');

	if (!user) {
		throw new ApplicationError('User not found', 404);
	}

	return res.json({
		data: user
	})
};


/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body;
	let errors = [];

	if (!email || !isEmail(email)) {
		errors.push({
			field: 'email',
			message: 'Email is not valid'
		})
	}
	if (!password || isEmpty(password) || !isLength(password, { min: 5 })) {
		errors.push({
			field: 'password',
      message: 'Password to short'
    });
	}

	if (!!errors.length) {
		throw new ApplicationError(errors, 400);
	}

	const user = await User.findOne({ email }, {
		// password: 1
	});

	if (!user) {
		throw new ApplicationError('User not found', 404)
	}

	const passwordCheck = bcrypt.compareSync(password, user.password);

	if (passwordCheck) {
		const token = jwt.sign({
			userId: user._id,
			email: user.email
		}, JWT_SECRET, {
			expiresIn: '7d'
		});

		return res.status(200).send({
			token: `Bearer ${token}`,
			data: user
		});
	} else {
		throw new ApplicationError('Account not found.', 404);
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
		errors.push({
      field: 'name',
      message: 'Name is not valid'
    });
	}
	if (!email || !isEmail(email)) {
		errors.push({
      field: 'email',
      message: 'Email is not valid'
    });
	}
	if (!password || isEmpty(password) || !isLength(password, { min: 5 })) {
		errors.push({
      field: 'password',
      message: 'Password to short'
    });
	}

	if (!!errors.length) {
		throw new ApplicationError(errors, 400);
	}

	const existingUser = await User.findOne({ email: req.body.email });

	if (existingUser) {
		throw new ApplicationError('Account with that email address already exists.', 403);
	}

	const user: IUser = await User.create({
		email,
		password,
		profile: {
			name: 'som'
		},
		role: 'CLIENT'
	});

	const token = jwt.sign({
		userId: user._id,
		email: user.email
	}, JWT_SECRET, {
		expiresIn: '7d'
	});

	return res.json({
		token: `Bearer ${token}`,
		data: user
	});
};


/**
 * PUT /user/like/:id
 * Like / unlike author
 */
export const putAuthorLike = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { id } = req.params;

	if (user.id == id) {
		throw new ApplicationError('Same user', 404);
	}

	const author: IUser = await User.findById(id, {
		followers: 1
	});

	if (!author) {
		throw new ApplicationError('Author not found', 404);
	}

	const liked = author.followers.includes(user._id);

	if (liked) {
		await author.updateOne({
			$pull: {
				followers: user.id
			}
		});
	} else {
		await author.updateOne({
			$addToSet: {
				followers: user.id
			}
		});
	}

	return res.json({
		data: !liked
	});
};