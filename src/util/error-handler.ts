import logger from './logger';

/**
 * Wrapper to catch async errors within a stage. Helps to avoid try catch blocks in there
 * @param fn - function to enter a stage
 */
const asyncWrapper = (fn: Function) => {
  return async function(next: Function) {
    try {
      return await fn();
    } catch (error) {
      logger.error('asyncWrapper error, %O', error);
      return next();
    }
  };
};

export default asyncWrapper;
