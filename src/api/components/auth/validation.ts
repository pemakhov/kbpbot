import { Schema } from 'joi';
import { ValidationError } from '../../errors/ValidationError';

function validateBodyWithSchema(schema: Schema, body: unknown): void {
  const { error } = schema.validate(body);

  if (error) {
    throw new ValidationError(error.message);
  }
}

export default {
  validateBodyWithSchema,
};
