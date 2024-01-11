import BaseError from '@common/errors/base-error';
import { NextFunction, Request, Response } from 'express';
import { errorMessages } from '@common/errors/messages';
import { UserRolEnum } from '@modules/users/user.enum';

export default function isAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (request.user?.role === UserRolEnum.ADMIN) {
    return next();
  }
  throw new BaseError(errorMessages.INVALID_CREDENTIALS);
}
