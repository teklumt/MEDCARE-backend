import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const firstMsg = errors[0]?.message.replace(/"/g, '') ?? 'Validation failed';

      res.status(400).json({
        success: false,
        error: firstMsg,
        errors
      });
      return;
    }

    req.body = value;
    next();
  };
};
