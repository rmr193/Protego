import { Response } from 'express';

export const sendSuccess = (res: Response, statusCode: number, data: any, message?: string) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

export const sendError = (res: Response, statusCode: number, message: string, errors?: any) => {
  return res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    errors
  });
};
