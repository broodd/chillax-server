import { Request, Response, NextFunction } from 'express';
import { Template, ITemplate } from '../models/Template';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';
import { Types } from 'mongoose';

/**
 * GET /templates
 * Get popular templates
 */
export const getTemplates = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const skip = (page - 1) * limit;

	const templates: ITemplate[] = await Template.find({})
		.sort({
			createdAt: -1
		})
		.skip(+skip)
		.limit(+limit);

	res.json({
		data: templates
	});
};

/**
 * POST /template
 * Create template
 */
export const postTemplate = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { name, img } = req.body;
	let errors = [];

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid');
	}
	if (!img || isEmpty(img)) {
		errors.push('Image is not valid');
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 404);
	}

	const template: ITemplate = await Template.create({
		name,
		img
	});

	return res.json({
		data: template
	});
};