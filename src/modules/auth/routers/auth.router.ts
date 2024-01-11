import { Router } from 'express';
import { AuthController } from '../auth.controller';
import { Joi, Segments, celebrate } from 'celebrate';
import { UserRolEnum } from '@modules/users/user.enum';

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

export default authRouter;
