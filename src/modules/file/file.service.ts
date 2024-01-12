import { Request, Response } from 'express';
import BaseError from '@common/errors/base-error';
import { errorMessages } from '@common/errors/messages';
import { responseWrapper } from '@common/utils';
import fileRepository from './repository/file.repository';
import { In } from 'typeorm';
export class FileService {
  async uploadFile(request: Request, Response: Response) {
    if (!request.file) {
      throw new BaseError(errorMessages.INVALID_FILE_TYPE);
    }

    await fileRepository.createOneOrUpdate(
      {
        filePath: `/${request.file.filename}`,
        hasReference: false,
      },
      { filePath: `/${request.file.filename}` },
    );

    return responseWrapper({ filePath: `/${request.file.filename}` }, Response);
  }

  async makeFileHaveRefrence(filePath: string) {
    const file = await fileRepository.findOneOrError(
      { filePath },
      errorMessages.FILE_NOT_FOUND,
    );
    await fileRepository.updateOneFromExistingModel(file, {
      hasReference: true,
    });
    return true;
  }

  async validateFilePath(filePath: string) {
    const file = await fileRepository.findOneOrError(
      { filePath },
      errorMessages.FILE_NOT_FOUND,
    );
    return file;
  }

  async silentRemoveReference(filePath: string | string[] | undefined) {
    try {
      filePath &&
        (await fileRepository.updateAll(
          { filePath: Array.isArray(filePath) ? In(filePath) : filePath },
          { hasReference: false },
        ));
    } catch (error) {
      console.log(`Error deleting file: ${filePath}`, error);
    }
    return true;
  }
}

export default new FileService();
