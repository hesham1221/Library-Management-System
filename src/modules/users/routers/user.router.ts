import isAuthenticated from '@common/middlewares/is-authenticated.middleware';
import { Router } from 'express';
import { UserController } from '../user.controller';

const userRouter = Router();

userRouter.use(isAuthenticated);
const userController = new UserController();

userRouter.get('/me', userController.me);

export default userRouter;
