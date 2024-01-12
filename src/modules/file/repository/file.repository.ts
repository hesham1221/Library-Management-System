import { BaseRepository } from '@common/types/base-repository';
import { DataSource } from 'typeorm';
import { dataSource } from '@common/database';
import { FileEntity } from '../enitities/file.entity';

class FileRepository extends BaseRepository<FileEntity> {
  constructor(private dataSource: DataSource) {
    super(FileEntity, dataSource.createEntityManager());
  }
}
export default new FileRepository(dataSource);
