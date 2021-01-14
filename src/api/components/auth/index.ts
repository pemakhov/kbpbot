import { Request, Response } from 'express';
import { UserNotFoundError } from '../../../bot/errors/UserNotFoundError';
import { TUser } from '../../../types/TUser';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import Validator from './validation';
import Service from './service';
import Schemas from './schemas';
import { ValidationError } from '../../errors/ValidationError';
import { NotFoundError } from '../../errors/NotFoundError';
import { ForbiddenError } from '../../errors/ForbiddenError';

function handleCodeRequest(req: Request, res: Response): void {
  try {
    Validator.validateBodyWithSchema(Schemas.telegramUsername, req.body);

    const { username } = req.body;
    const user: TUser | undefined = Service.getUserByUsername(username.toLowerCase());

    Service.isUserFoundAndAdmin(user);

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST);
    } else if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND);
    } else if (error instanceof ForbiddenError) {
      res.status(StatusCodes.FORBIDDEN);
    }
    res.json({ error });
  }
}

export default {
  handleCodeRequest,
};
