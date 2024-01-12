import storageConfig from '@config/upload';
import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { FileEntity } from '../enitities/file.entity';
import { dataSource } from '@common/database';
import * as path from 'path';
import BaseError from '@common/errors/base-error';
import { errorMessages } from '@common/errors/messages';
import { responseWrapper } from '@common/utils';
import fileService from '../file.service';
const fileRouter = Router();

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
    throw new BaseError(errorMessages.INVALID_FILE_TYPE);
  }
  callback(null, true);
};

const upload = multer({
  storage: storageConfig.storage,
  fileFilter: imageFilter,
});

fileRouter.post('/', upload.single('file'), fileService.uploadFile);

export default fileRouter;
