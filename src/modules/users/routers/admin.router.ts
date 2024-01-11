import { Router } from 'express';
import { UserService } from '../user.service';
import isAuthenticated from '@common/middlewares/is-authenticated.middleware';
import isAdmin from '@common/middlewares/is-admin.middleware';
import { Joi, Segments, celebrate } from 'celebrate';
import { UserRolEnum } from '../user.enum';
import { UserController } from '../user.controller';

const adminRouter = Router();
const userController = new UserController();
adminRouter.use(isAuthenticated);
adminRouter.use(isAdmin);

adminRouter.post(
  '/user',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
      role: Joi.string()
        .valid(UserRolEnum.BORROWER, UserRolEnum.ADMIN)
        .required(),
    },
  }),
  userController.createUserByAdmin,
);

adminRouter.get('/users', userController.getUsers);
adminRouter.get(
  '/users/:slug',
  celebrate({
    [Segments.PARAMS]: {
      slug: Joi.string().required(),
    },
  }),
  userController.userBoard,
);

export default adminRouter;
