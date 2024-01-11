import { Response } from 'express';
import { LoginDto } from './dto/login-admin.dto';
import userRepository from '@modules/users/repositories/user.repository';
import { UserVerificationCodeUseCaseEnum } from '@modules/users/user.enum';
import { errorMessages } from '@common/errors/messages';
import {
  appendAuthTokenToUser,
  generateVerificationCodeAndExpiryDate,
  hashPassword,
  matchPassword,
  responseWrapper,
  slugify,
} from '@common/utils';
import { CreateUserByAdminInput } from '@modules/users/dto/create-user-by-admin.dto';
import userVerificationCodeRepository from '@modules/users/repositories/user-verification-code.repository';
import mailService from '@common/providers/mail';
import { MoreThan } from 'typeorm';
import BaseError from '@common/errors/base-error';
export class AuthService {
  async login(input: LoginDto, response: Response) {
    const user = await userRepository.findOneOrError(
      { verifiedEmail: input.email, role: input.role },
      errorMessages.INVALID_CREDENTIALS,
    );
    await matchPassword(input.password, user.password);
    return responseWrapper(appendAuthTokenToUser(user), response);
  }

  async signupBorrower(
    input: Omit<CreateUserByAdminInput, 'role'>,
    response: Response,
  ) {
    await userRepository.findOneWithErorr(
      { verifiedEmail: input.email },
      errorMessages.USER_ALREADY_EXISTS,
    );
    const { email, password, ...rest } = input;
    await userRepository.deleteAll({ notVerifiedEmail: email });
    const user = await userRepository.createOne({
      ...rest,
      notVerifiedEmail: email,
      password: await hashPassword(password),
      slug: slugify(rest.name),
    });
    const verificationData = generateVerificationCodeAndExpiryDate();
    await userVerificationCodeRepository.createOne({
      user,
      useCase: UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION,
      code: verificationData.verificationCode,
      expiryDate: verificationData.expiryDateAfterOneHour,
    });
    await mailService.sendMail({
      subject: 'Verify your email',
      to: email,
      templateName: 'otp',
      templateData: {
        otp: verificationData.verificationCode,
      },
    });
    return responseWrapper(user, response);
  }

  async resendOtp(
    email: string,
    useCase: UserVerificationCodeUseCaseEnum,
    response: Response,
  ) {
    const user = await userRepository.findOneOrError(
      { notVerifiedEmail: email },
      errorMessages.USER_NOT_FOUND,
    );
    await userVerificationCodeRepository.deleteAll({ user, useCase });
    const verificationData = generateVerificationCodeAndExpiryDate();
    await userVerificationCodeRepository.createOne({
      user,
      useCase: useCase,
      code: verificationData.verificationCode,
      expiryDate: verificationData.expiryDateAfterOneHour,
    });
    await mailService.sendMail({
      subject: 'Verify your email',
      to: email,
      templateName: 'otp',
      templateData: {
        otp: verificationData.verificationCode,
      },
    });
    return responseWrapper(null, response);
  }

  async verifyOtp(
    email: string,
    otp: string,
    useCase: UserVerificationCodeUseCaseEnum,
    response: Response,
  ) {
    const user = await userRepository.findOneOrError(
      useCase === UserVerificationCodeUseCaseEnum.PASSWORD_RESET
        ? { verifiedEmail: email }
        : { notVerifiedEmail: email },
      errorMessages.USER_NOT_FOUND,
    );
    await userVerificationCodeRepository.findOneOrError(
      {
        user: { id: user.id },
        useCase,
        code: otp,
        expiryDate: MoreThan(new Date()),
      },
      errorMessages.INVALID_VERIFICATION_CODE,
    );
    useCase !== UserVerificationCodeUseCaseEnum.PASSWORD_RESET &&
      (await userVerificationCodeRepository.deleteAll({ user, useCase }));
    await userRepository.updateOneFromExistingModel(user, {
      verifiedEmail: email,
      notVerifiedEmail: null as any,
    });
    if (useCase === UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION)
      await mailService.sendMail({
        subject: 'Welcome to our liberary',
        to: email,
        templateName: 'sign-up',
      });
    return responseWrapper(appendAuthTokenToUser(user), response);
  }
  async forgetPassword(email: string, response: Response) {
    const user = await userRepository.findOneOrError(
      { verifiedEmail: email },
      errorMessages.USER_NOT_FOUND,
    );
    await userVerificationCodeRepository.deleteAll({
      user,
      useCase: UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
    });
    const verificationData = generateVerificationCodeAndExpiryDate();
    await userVerificationCodeRepository.createOne({
      user,
      useCase: UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
      code: verificationData.verificationCode,
      expiryDate: verificationData.expiryDateAfterOneHour,
    });
    await mailService.sendMail({
      subject: 'Verify your email',
      to: email,
      templateName: 'otp',
      templateData: {
        otp: verificationData.verificationCode,
      },
    });
    return responseWrapper(null, response);
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    response: Response,
  ) {
    const user = await userRepository.findOneOrError(
      { verifiedEmail: email },
      errorMessages.USER_NOT_FOUND,
    );
    await userVerificationCodeRepository.findOneOrError(
      {
        user,
        useCase: UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
        code: otp,
        expiryDate: MoreThan(new Date()),
      },
      errorMessages.INVALID_VERIFICATION_CODE,
    );
    if (await matchPassword(newPassword, user.password, false)) {
      throw new BaseError(errorMessages.PASSWORD_CANNOT_BE_SAME);
    }
    await userVerificationCodeRepository.deleteAll({
      user,
      useCase: UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
    });
    await userRepository.updateOneFromExistingModel(user, {
      password: await hashPassword(newPassword),
    });
    return responseWrapper(null, response);
  }
}
