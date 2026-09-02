import { ZodTypeAny, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, 'Validation failed', error.issues);
      }
      next(error);
    }
  };
};
