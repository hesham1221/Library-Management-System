import BaseError from '@common/errors/base-error';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { errorMessages } from '@common/errors/messages';
import { IJwtPayload } from '@common/types/types';
import { get } from 'env-var';
import userRepository from '@modules/users/repositories/user.repository';

export default async function isAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.headers?.authorization?.split('Bearer ')[1];
  if (!token) {
    throw new BaseError(errorMessages.UNAUTHORIZED);
  }
  try {
    const data = jwt.verify(
      token,
      get('JWT_SECRET').asString() || 'secret',
    ) as { userId: string };
    request.user = await userRepository.findOneOrError(
      { id: data.userId },
      errorMessages.UNAUTHORIZED,
    );
    return next();
  } catch (error) {
    throw new BaseError(errorMessages.UNAUTHORIZED);
  }
}
