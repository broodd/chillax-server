import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const template = Router();

import authGuard from '../middlewares/authGuard';
import checkAdmin from '../middlewares/checkAdmin';

/**
 * Controllers (route handlers)
 */
import * as templateController from '../controllers/template';

template.get('/templates', authGuard, asyncWrapper(templateController.getTemplates));
template.post('/template', [authGuard, checkAdmin], asyncWrapper(templateController.postTemplate));

export default template;