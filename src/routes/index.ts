import authRouter from '@modules/auth/routers/auth.router';
import adminRouter from '@modules/users/routers/admin.router';
import { Router } from 'express';

const routes = Router();
routes.use('/admin', adminRouter);
routes.use('/auth', authRouter);

export default routes;
