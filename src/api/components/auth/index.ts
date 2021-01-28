import { NextFunction, Request, Response } from 'express';
import { TUser } from '../../../types/TUser';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import Validator from './validation';
import Service from './service';
import Schemas from './schemas';
import Constants from '../../constants';
import { ValidationError } from '../../errors/ValidationError';
import { NotFoundError } from '../../errors/NotFoundError';
import { ForbiddenError } from '../../errors/ForbiddenError';
import { bot } from '../../../index';
import { TConfirmCode } from './types';
import jwt from 'jsonwebtoken';
import constants from '../../constants';

const CONFIRM_CODE_LENGTH: number = (process.env.CONFIRM_CODE_LENGTH && +process.env.CONFIRM_CODE_LENGTH) || 4;
const CONFIRM_CODE_LIFE_TIME = 1000 * 60 * 3; // 3 minutes
const confirmCodes: Map<number, TConfirmCode> = new Map();

const getTokens = async (user: TUser) => {
  const accessToken = await new Promise((resolve) => {
    jwt.sign(user, Constants.ACCESS_TOKEN_SECRET, { expiresIn: constants.ACCESS_TOKEN_EXPIRES_IN }, (error, token) => {
      resolve(token);
    });
  });
  const refreshToken = await new Promise((resolve) => {
    jwt.sign(user, Constants.REFRESH_TOKEN_SECRET, (error, token) => {
      resolve(token);
    });
  });

  const tokens = { accessToken, refreshToken };

  return tokens;
};

function handleCodeRequest(req: Request, res: Response): void {
  try {
    Validator.validateBodyWithSchema(Schemas.telegramUsernameBody, req.body);

    const { username } = req.body;
    const searchableUsername = username.trim().toLowerCase();
    const user: TUser | undefined = Service.getUserByUsername(searchableUsername);

    if (!user) throw new NotFoundError('User not found');
    if (!user.isAdmin) throw new ForbiddenError('Forbidden. User is not admin');

    const code: string = Service.getConfirmCode(CONFIRM_CODE_LENGTH);

    Service.deleteOldConfirmCode(user?.id || 0, confirmCodes);
    Service.saveConfirmCode(user.id, code, confirmCodes, CONFIRM_CODE_LIFE_TIME);

    bot.sendMessage(user?.id || 0, code);

    res.cookie('userId', user.id);
    res.status(StatusCodes.OK).json({ error: null, message: ReasonPhrases.OK });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST);
    } else if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND);
    } else if (error instanceof ForbiddenError) {
      res.status(StatusCodes.FORBIDDEN);
    }

    console.error(error);
    res.json({ error: error, message: error.message });
  }
}

async function processLoginWithCode(req: Request, res: Response): Promise<void> {
  try {
    Validator.validateBodyWithSchema(Schemas.confirmCodeBody, req.body);

    const { code } = req.body;
    const { userId } = req.cookies;

    if (!Service.isCodeCorrect(code, userId, confirmCodes)) {
      throw new ForbiddenError('Forbidden. Code is not correct');
    }

    const user: TUser | undefined = Service.getUserById(userId);

    if (!user) throw new NotFoundError('User not found');
    if (!user.isAdmin) throw new ForbiddenError('Forbidden. User is not admin');

    res.status(200).json(await getTokens(user));
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(StatusCodes.BAD_REQUEST);
    } else if (error instanceof NotFoundError) {
      res.status(StatusCodes.NOT_FOUND);
    } else if (error instanceof ForbiddenError) {
      res.status(StatusCodes.FORBIDDEN);
    }

    console.error(error);
    res.json({ error: error, message: error.message });
  }
}

function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authorization: string = req.headers['authorization'] as string;

  if (authorization === undefined) return next();

  const accessToken: string = authorization.split(' ')[1];

  jwt.verify(accessToken, constants.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshAddress = req.path;
        res.status(StatusCodes.FORBIDDEN).render('refresh', { refreshAddress });
      }
      throw error;
    }

    const { userName } = decoded as TUser;

    req.body.userName = userName;
    next();
  });
}

function refresh(req: Request, res: Response): void {
  const { refreshToken } = req.body;

  jwt.verify(
    refreshToken,
    constants.REFRESH_TOKEN_SECRET,
    async (error: unknown, decoded: unknown): Promise<void> => {
      if (error) {
        res.sendStatus(401);
        return;
      }

      const { id, isAdmin, firstName, lastName, userName, date, languageCode } = decoded as TUser;

      const user = {
        id,
        isAdmin,
        firstName,
        lastName,
        userName,
        date,
        languageCode,
      };

      res.status(StatusCodes.OK).json(await getTokens(user));
    }
  );
}

export default {
  authenticate,
  handleCodeRequest,
  processLoginWithCode,
  refresh,
};
