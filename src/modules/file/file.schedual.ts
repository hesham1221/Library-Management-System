import * as cron from 'node-cron';
import { CronDuration } from '@common/types/types';
import fileRepository from './repository/file.repository';
import fs from 'fs/promises';
import path from 'path';
async function deleteUnreferencedFiles() {
  const files = await fileRepository.findAll({ hasReference: false });
  const fileDeletionPromises = files.map(file => {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      file.filePath.substring(1),
    );
    return fs
      .unlink(filePath)
      .catch(err => console.error(`Error deleting file: ${filePath}`, err));
  });
  await Promise.all(fileDeletionPromises);
  await fileRepository.deleteAll({ hasReference: false });
}

cron.schedule(CronDuration.EVERY_DAY_MIDNIGHT, () => {
  deleteUnreferencedFiles();
  console.log('File deletion Cron job executed.');
});
