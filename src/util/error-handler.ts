import logger from './logger';
import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper to catch async errors within a stage. Helps to avoid try catch blocks in there
 * @param fn - function to enter a stage
 */
const asyncWrapper = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      logger.error('asyncWrapper error, %O', error);
      return next(error);
    }
  };
};

export default asyncWrapper;
