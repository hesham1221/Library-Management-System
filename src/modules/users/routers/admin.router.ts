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
  '/',
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

adminRouter.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      page: Joi.number().default(1),
      limit: Joi.string().default(15),
      searchKey: Joi.string(),
      role: Joi.string().valid(UserRolEnum.BORROWER, UserRolEnum.ADMIN),
    },
  }),
  userController.getUsers,
);
adminRouter.get(
  '/:slug',
  celebrate({
    [Segments.PARAMS]: {
      slug: Joi.string().required(),
    },
  }),
  userController.userBoard,
);

adminRouter.delete(
  '/:slug',
  celebrate({
    [Segments.PARAMS]: {
      slug: Joi.string().required(),
    },
  }),
  userController.deleteUserByAdmin,
);

adminRouter.patch(
  '/:slug',
  celebrate({
    [Segments.PARAMS]: {
      slug: Joi.string().required(),
    },
    [Segments.BODY]: {
      email: Joi.string().email(),
      password: Joi.string(),
      name: Joi.string(),
      role: Joi.string().valid(UserRolEnum.BORROWER, UserRolEnum.ADMIN),
    },
  }),
  userController.updateUserByAdmin,
);

export default adminRouter;
