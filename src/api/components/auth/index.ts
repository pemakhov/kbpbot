import { Request, Response } from 'express';
import { TUser } from '../../../types/TUser';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import Validator from './validation';
import Service from './service';
import Schemas from './schemas';
import { ValidationError } from '../../errors/ValidationError';
import { NotFoundError } from '../../errors/NotFoundError';
import { ForbiddenError } from '../../errors/ForbiddenError';
import { bot } from '../../../index';
import Constants from '../../../constants';
import { TConfirmCode } from './types';

const confirmCodes: Map<number, TConfirmCode> = new Map();

function handleCodeRequest(req: Request, res: Response): void {
  try {
    Validator.validateBodyWithSchema(Schemas.telegramUsername, req.body);

    const { username } = req.body;
    const user: TUser | undefined = Service.getUserByUsername(username.toLowerCase());

    if (!user) throw new NotFoundError('User not found');
    if (!user.isAdmin) throw new ForbiddenError('Forbidden. User is not admin');

    const code: string = Service.getConfirmCode(Constants.CONFIRM_CODE_LENGTH);

    Service.deleteOldConfirmCode(user?.id || 0, confirmCodes);
    Service.saveConfirmCode(user.id, code, confirmCodes);

    bot.sendMessage(user?.id || 0, code);

    res.status(StatusCodes.OK).json({ error: null, message: ReasonPhrases.OK });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST);
    } else if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND);
    } else if (error instanceof ForbiddenError) {
      res.status(StatusCodes.FORBIDDEN);
    }

    res.json({ error: error, message: error.message });
  }
}

function handleTokenRequest(req: Request, res: Response): void {}

export default {
  handleCodeRequest,
  handleTokenRequest,
};
