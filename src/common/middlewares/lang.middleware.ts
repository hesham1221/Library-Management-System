import { LangEnum } from '@common/types/types';
import { NextFunction, Request, Response } from 'express';

export default function lang(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const langHeader = (request.query?.lang || request.headers?.lang) as string; // get lang from query or header (query takes precedence over header)
  request.lang = LangEnum[langHeader?.toUpperCase() as LangEnum] || LangEnum.EN;
  return next();
}
