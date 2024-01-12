import authRouter from '@modules/auth/routers/auth.router';
import bookRouter from '@modules/books/routes/book.router';
import fileRouter from '@modules/file/routers/file.router';
import adminRouter from '@modules/users/routers/admin.router';
import userRouter from '@modules/users/routers/user.router';
import { Router } from 'express';

const routes = Router();
routes.use('/admin', adminRouter);
routes.use('/auth', authRouter);
routes.use('/users', userRouter);
routes.use('/upload', fileRouter);
routes.use(bookRouter);

export default routes;
