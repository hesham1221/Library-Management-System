import { Router } from 'express';
import { AuthController } from '../auth.controller';
import { Joi, Segments, celebrate } from 'celebrate';
import {
  UserRolEnum,
  UserVerificationCodeUseCaseEnum,
} from '@modules/users/user.enum';
import { enumToArray } from '@common/utils';

const authRouter = Router();
const authController = new AuthController();
authRouter.post(
  '/sign-in',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().valid(UserRolEnum.ADMIN, UserRolEnum.BORROWER),
    },
  }),
  authController.login,
);

authRouter.post(
  '/sign-up',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    },
  }),
  authController.signupBorrower,
);

authRouter.post(
  '/resend-otp',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      useCase: Joi.string().valid(
        ...enumToArray(UserVerificationCodeUseCaseEnum),
      ),
    },
  }),
  authController.resendOtp,
);

authRouter.post(
  '/verify-otp',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
      useCase: Joi.string().valid(
        ...enumToArray(UserVerificationCodeUseCaseEnum),
      ),
    },
  }),
  authController.verifyOtp,
);

authRouter.post(
  '/forgot-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  authController.forgetPassword,
);

authRouter.post(
  '/reset-password',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  authController.resetPassword,
);

export default authRouter;
