import slug from 'speakingurl';
import { generate } from 'voucher-code-generator';
import { ImageExtensionsAsSet } from './image.extensions';
import path from 'path';
import jwt from 'jsonwebtoken';
import { get } from 'env-var';
import bcrypt from 'bcrypt';
import BaseError from '@common/errors/base-error';
import { errorMessages } from '@common/errors/messages';
import { User } from '@modules/users/entities/user.entity';
import { ResponseType } from '@common/types/response.type';
import { Response } from 'express';

export function slugify(value: string): string {
  if (value.charAt(value.length - 1) === '-')
    value = value.slice(0, value.length - 1);
  return `${slug(value, { titleCase: true })}-${
    generate({
      charset: '123456789abcdefghgklmnorstuvwxyz',
      length: 4,
    })[0]
  }`.toLowerCase();
}

export function isImage(filePath: string): boolean {
  if (!filePath) return false;
  return ImageExtensionsAsSet.has(
    path.extname(filePath).slice(1).toLowerCase(),
  );
}

export function formatDateddmmyyyy(date: Date) {
  let day: string | number = date.getDate();
  let month: string | number = date.getMonth() + 1;
  let year = date.getFullYear();
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;
  return `${day}/${month}/${year}`;
}

export function getDateOnly(timestamp: Date): Date {
  if (timestamp instanceof Date) {
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(timestamp.getDate()).padStart(2, '0');
    const formattedDate = `${month}/${day}/${year % 100}`;
    return new Date(`${formattedDate}`);
  } else {
    throw new Error('Input must be a Date object');
  }
}

export function generateAuthToken(id: string, isTemporary = false): string {
  return jwt.sign({ userId: id }, get('JWT_SECRET').required().asString(), {
    ...(isTemporary && { expiresIn: 30 * 60 }),
  });
}

export async function matchPassword(
  password: string,
  hash: string,
  throwError: boolean = true,
) {
  const isMatched = await bcrypt.compare(password, hash);
  if (!isMatched && throwError)
    throw new BaseError(errorMessages.INVALID_CREDENTIALS);
  return isMatched;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export function appendAuthTokenToUser(user: User) {
  return Object.assign(user, { token: generateAuthToken(user.id) });
}

export function responseWrapper<T>(
  data: T,
  experessResponse: Response,
  message = 'operation done successfully',
  code = 200,
  innerFieldHasPass?: keyof T,
): Response<ResponseType<T>> {
  return experessResponse.json({
    data: !innerFieldHasPass
      ? data
        ? removePassword(data)
        : null
      : {
          ...data,
          [innerFieldHasPass]: removePassword(data[innerFieldHasPass]),
        },
    message,
    code,
  });
}
export function removePassword<T>(input: T | T[]): T | T[] {
  const removePassFromObj = ({ password, ...rest }: any = {}) => rest;
  return Array.isArray(input)
    ? input.map(removePassFromObj)
    : removePassFromObj(input);
}

export function generateVerificationCodeAndExpiryDate() {
  return {
    verificationCode:
      get('NODE_ENV').asString() === 'production'
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : '1234',
    expiryDateAfterOneHour: new Date(Date.now() + 3600000),
  };
}

export function enumToArray(enumObj: any): string[] {
  return Object.values(enumObj);
}
