import 'reflect-metadata';
import 'dotenv/config';
import 'module-alias/register';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import { errors } from 'celebrate';
import routes from './routes';
import uploadConfig from '@config/upload';
import { LangEnum } from '@common/types/types';
import lang from '@common/middlewares/lang.middleware';
import rateLimiter from '@common/middlewares/rate-limitter.middleware';
import BaseError from '@common/errors/base-error';
import { dataSource } from '@common/database';
import { get } from 'env-var';
import { User } from '@modules/users/entities/user.entity';
import '@modules/file/file.schedual';

async function main() {
  try {
    const PORT = get('PORT').asInt() || 5000;
    const app = express();
    await dataSource.initialize();

    app.use(cors());
    app.use(express.json());
    app.use(lang);
    app.use(rateLimiter);
    app.use('/files', express.static(uploadConfig.directory));
    app.use(routes);
    app.use(errors());
    app.use(
      (
        error: Error,
        request: Request,
        response: Response,
        next: NextFunction,
      ) => {
        if (error instanceof BaseError) {
          return response.status(error.statusCode).json({
            data: null,
            message: error.message[request.lang],
            code: error.statusCode,
          });
        }
        console.log(error);
        return response.status(500).json({
          data: null,
          message: 'Something went wrong',
          code: 500,
        });
      },
    );

    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (error) {
    console.log(`An error ocurred: ${error}`);
    process.exit(1);
  }
}

main();

declare global {
  namespace Express {
    interface Request {
      user: User;
      lang: LangEnum;
    }
  }
}
